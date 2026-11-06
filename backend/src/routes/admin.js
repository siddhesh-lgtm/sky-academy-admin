import { Router } from 'express';
import { query, execute } from '../db.js';
import { asyncHandler, httpError, asString, writeAudit } from '../http.js';

const router = Router();

function centerPayload(row) {
  const cfg = typeof row.configuration_json === 'string'
    ? JSON.parse(row.configuration_json)
    : (row.configuration_json || {});
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    area: cfg.area || row.city,
    address: row.address,
    sports: row.sports ? String(row.sports).split(',').filter(Boolean) : ['Cricket'],
    status: row.status,
    coaches: Number(row.coaches || 0),
    capacity: Number(cfg.capacity || 0),
  };
}

function passportPayload(row) {
  const rules = typeof row.rules_json === 'string' ? JSON.parse(row.rules_json) : (row.rules_json || {});
  return {
    id: row.plan_id,
    name: row.name,
    duration: Number(row.duration_days),
    credits: Number(row.included_sessions || 0),
    price: Number(row.price_minor) / 100,
    access: rules.access || 'All eligible centers',
    status: row.plan_status,
  };
}

function sessionPayload(row) {
  return {
    id: row.id,
    title: row.title,
    sport: row.sport_name || 'Cricket',
    center: row.center_name,
    coach: row.coach_name || 'Unassigned',
    date: row.session_date,
    time: row.session_time,
    capacity: Number(row.max_players),
    booked: Number(row.booked_count),
    status: row.status,
  };
}

// ---- Centers ----
router.get('/centers', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT c.*,
      (SELECT GROUP_CONCAT(DISTINCT sp.name)
         FROM training_sessions ts
         JOIN sports sp ON sp.id = ts.sport_id
        WHERE ts.center_id = c.id) AS sports,
      (SELECT COUNT(*) FROM staff_center_assignments sca
        WHERE sca.center_id = c.id AND sca.ended_at IS NULL) AS coaches
    FROM centers c
    ORDER BY c.id DESC
  `);
  res.json(rows.map(centerPayload));
}));

router.post('/centers', asyncHandler(async (req, res) => {
  const name = asString(req.body.name, 180);
  const city = asString(req.body.city, 100);
  const address = asString(req.body.address, 500);
  if (!name || !city || !address) throw httpError(400, 'Center name, city and address are required');

  const code = `CTR-${Date.now().toString().slice(-8)}`;
  const configuration = { area: city, capacity: 12, sports: ['Cricket'] };
  const result = await execute(
    `INSERT INTO centers (code, name, address, city, configuration_json, status)
     VALUES (?, ?, ?, ?, CAST(? AS JSON), 'Active')`,
    [code, name, address, city, JSON.stringify(configuration)],
  );

  await writeAudit(execute, {
    action: 'center.created',
    entityType: 'center',
    entityId: result.insertId,
    newValues: { name, city, address },
    ip: req.ip,
  });

  res.status(201).json({
    id: result.insertId,
    name,
    city,
    area: city,
    address,
    status: 'Active',
    sports: ['Cricket'],
    coaches: 0,
    capacity: 12,
  });
}));

router.get('/applications', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT id, center_name AS name, JSON_UNQUOTE(JSON_EXTRACT(application_json,'$.city')) AS city,
           applicant_name AS applicant, DATE_FORMAT(submitted_at,'%b %d, %Y') AS date, status
    FROM center_applications
    ORDER BY id DESC
  `);
  res.json(rows.map((r) => ({
    id: `APP-${r.id}`,
    name: r.name,
    city: r.city || '',
    applicant: r.applicant,
    date: r.date,
    status: r.status,
  })));
}));

// ---- Passports ----
router.get('/passports', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT p.id AS plan_id, p.name, p.status AS plan_status,
           v.duration_days, v.included_sessions, v.price_minor, v.rules_json
    FROM passport_plans p
    JOIN passport_plan_versions v ON v.plan_id = p.id
    WHERE v.version_number = (
      SELECT MAX(v2.version_number) FROM passport_plan_versions v2 WHERE v2.plan_id = p.id
    )
    ORDER BY p.id DESC
  `);
  res.json(rows.map(passportPayload));
}));

router.post('/passports', asyncHandler(async (req, res) => {
  const name = asString(req.body.name, 150);
  const duration = Number(req.body.duration);
  const credits = Number(req.body.credits);
  const price = Number(req.body.price);
  const access = req.body.access || 'All eligible centers';
  const allowedAccess = ['All eligible centers', 'Selected centers', 'Selected city'];

  if (!name || !Number.isSafeInteger(duration) || duration <= 0
    || !Number.isSafeInteger(credits) || credits < 0
    || !Number.isFinite(price) || price < 0
    || !allowedAccess.includes(access)) {
    throw httpError(400, 'Invalid Passport data');
  }

  const code = `PLAN-${Date.now().toString().slice(-8)}`;
  const plan = await execute(
    `INSERT INTO passport_plans (code, name, passport_type, status) VALUES (?, ?, 'standard', 'Draft')`,
    [code, name],
  );
  await execute(
    `INSERT INTO passport_plan_versions
      (plan_id, version_number, price_minor, currency, duration_days, allowance_type, included_sessions, rules_json, published_at)
     VALUES (?, 1, ?, 'INR', ?, 'credits', ?, CAST(? AS JSON), NULL)`,
    [plan.insertId, Math.round(price * 100), duration, credits, JSON.stringify({ access })],
  );

  await writeAudit(execute, {
    action: 'passport.plan.created',
    entityType: 'passport_plan',
    entityId: plan.insertId,
    newValues: { name, duration, credits, price, access },
    ip: req.ip,
  });

  res.status(201).json({
    id: plan.insertId,
    name,
    duration,
    credits,
    price,
    access,
    status: 'Draft',
  });
}));

// ---- Sessions ----
router.get('/sessions', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT ts.id, ts.title, ts.max_players, ts.booked_count, ts.status,
           DATE_FORMAT(ts.starts_at, '%Y-%m-%d') AS session_date,
           TIME_FORMAT(ts.starts_at, '%H:%i') AS session_time,
           c.name AS center_name, sp.name AS sport_name,
           (SELECT u.full_name FROM session_coaches sc
              JOIN users u ON u.id = sc.coach_user_id
             WHERE sc.session_id = ts.id AND sc.assignment_type = 'primary'
             LIMIT 1) AS coach_name
    FROM training_sessions ts
    JOIN centers c ON c.id = ts.center_id
    JOIN sports sp ON sp.id = ts.sport_id
    ORDER BY ts.starts_at DESC
  `);
  res.json(rows.map(sessionPayload));
}));

router.post('/sessions', asyncHandler(async (req, res) => {
  const title = asString(req.body.title, 180);
  const sport = asString(req.body.sport, 80) || 'Cricket';
  const center = asString(req.body.center, 180);
  const coach = asString(req.body.coach, 150);
  const date = asString(req.body.date, 10);
  const time = asString(req.body.time, 5);
  const capacity = Number(req.body.capacity);

  if (!title || !center || !coach
    || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')
    || !/^\d{2}:\d{2}$/.test(time || '')
    || !Number.isSafeInteger(capacity) || capacity < 1) {
    throw httpError(400, 'Invalid session data');
  }

  const centers = await query(
    `SELECT id FROM centers WHERE name = ? AND status = 'Active' LIMIT 1`,
    [center],
  );
  if (!centers.length) throw httpError(400, 'Active center not found');

  let sports = await query(`SELECT id, name FROM sports WHERE name = ? AND status = 'active' LIMIT 1`, [sport]);
  if (!sports.length) {
    sports = await query(`SELECT id, name FROM sports WHERE code = 'cricket' LIMIT 1`);
  }
  if (!sports.length) throw httpError(400, 'Sport not configured');

  const startsAt = `${date} ${time}:00.000`;
  const endsAt = `${date} ${time}:00.000`;
  const result = await execute(
    `INSERT INTO training_sessions
      (center_id, sport_id, title, starts_at, ends_at, booking_opens_at, booking_closes_at,
       max_players, booked_count, minimum_age, maximum_age, credit_cost, status)
     VALUES (?, ?, ?, ?, DATE_ADD(?, INTERVAL 90 MINUTE), DATE_SUB(?, INTERVAL 6 DAY), DATE_SUB(?, INTERVAL 1 HOUR),
             ?, 0, 8, 12, 1, 'Open')`,
    [centers[0].id, sports[0].id, title, startsAt, startsAt, startsAt, startsAt, capacity],
  );

  const coachUsers = await query(`SELECT id FROM users WHERE full_name = ? LIMIT 1`, [coach]);
  if (coachUsers.length) {
    await execute(
      `INSERT INTO session_coaches (session_id, coach_user_id, assignment_type) VALUES (?, ?, 'primary')`,
      [result.insertId, coachUsers[0].id],
    );
  }

  await writeAudit(execute, {
    action: 'session.created',
    entityType: 'training_session',
    entityId: result.insertId,
    newValues: { title, center, coach, date, time, capacity },
    ip: req.ip,
  });

  res.status(201).json({
    id: result.insertId,
    title,
    sport: sports[0].name,
    center,
    coach,
    date,
    time,
    capacity,
    booked: 0,
    status: 'Open',
  });
}));

// ---- Bookings ----
router.get('/bookings', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT sb.id,
           CONCAT(pp.first_name, ' ', IFNULL(pp.last_name,'')) AS player,
           TIMESTAMPDIFF(YEAR, pp.date_of_birth, CURDATE()) AS age,
           gu.full_name AS parent,
           ts.title AS session_title,
           c.name AS center_name,
           pl.name AS passport_name,
           sb.status
    FROM session_bookings sb
    JOIN player_profiles pp ON pp.id = sb.player_id
    JOIN training_sessions ts ON ts.id = sb.session_id
    JOIN centers c ON c.id = ts.center_id
    JOIN player_passports ppass ON ppass.id = sb.player_passport_id
    JOIN passport_plan_versions pv ON pv.id = ppass.plan_version_id
    JOIN passport_plans pl ON pl.id = pv.plan_id
    LEFT JOIN player_guardians pg ON pg.player_id = pp.id AND pg.is_primary = 1
    LEFT JOIN users gu ON gu.id = pg.parent_user_id
    ORDER BY sb.id DESC
  `);
  res.json(rows.map((r) => ({
    id: `BK-${r.id}`,
    player: r.player.trim(),
    age: Number(r.age),
    parent: r.parent || '',
    session: r.session_title,
    center: r.center_name,
    passport: r.passport_name,
    status: r.status,
  })));
}));

// ---- Web admin users only (surface=admin). Coach/Parent never appear here. ----
router.get('/users', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT u.full_name AS name, u.email, r.name AS role,
           COALESCE((
             SELECT GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ')
             FROM staff_center_assignments sca
             JOIN centers c ON c.id = sca.center_id
             WHERE sca.user_id = u.id AND sca.ended_at IS NULL
           ), IF(r.code = 'sky_super_admin', 'All centers',
              IF(r.code = 'finance_accounts', 'Platform-wide', 'Unassigned center'))) AS center,
           u.status
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id
    WHERE r.surface = 'admin'
      AND r.code IN ('sky_super_admin', 'finance_accounts', 'center_admin')
    ORDER BY u.id
  `);
  res.json(rows.map((r) => ({
    name: r.name,
    email: r.email,
    role: r.role,
    center: r.center,
    status: r.status === 'active' ? 'Active' : r.status,
  })));
}));

router.get('/roles', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT id, code, name, surface, is_active
    FROM roles
    WHERE surface = 'admin' AND is_active = 1
    ORDER BY id
  `);
  res.json(rows);
}));

// Coach / Head Coach assignments for Staff module (not web login accounts)
router.get('/staff', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT u.full_name AS name, u.email, r.name AS role, c.name AS center, u.status
    FROM staff_center_assignments sca
    JOIN users u ON u.id = sca.user_id
    JOIN roles r ON r.id = sca.role_id
    JOIN centers c ON c.id = sca.center_id
    WHERE sca.ended_at IS NULL
      AND r.surface IN ('coach', 'admin')
      AND r.code IN ('head_coach', 'coach', 'center_admin')
    ORDER BY sca.id
  `);
  res.json(rows.map((r) => ({
    name: r.name,
    email: r.email,
    role: r.role,
    center: r.center,
    status: r.status === 'active' ? 'Active' : r.status,
  })));
}));

// ---- Players ----
router.get('/players', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT CONCAT(pp.first_name,' ',IFNULL(pp.last_name,'')) AS player,
           TIMESTAMPDIFF(YEAR, pp.date_of_birth, CURDATE()) AS age,
           gu.full_name AS guardian,
           (
             SELECT pl.name
             FROM player_passports ppass
             JOIN passport_plan_versions pv ON pv.id = ppass.plan_version_id
             JOIN passport_plans pl ON pl.id = pv.plan_id
             WHERE ppass.player_id = pp.id
             ORDER BY ppass.id DESC
             LIMIT 1
           ) AS passport,
           (
             SELECT c.name
             FROM session_bookings sb
             JOIN training_sessions ts ON ts.id = sb.session_id
             JOIN centers c ON c.id = ts.center_id
             WHERE sb.player_id = pp.id
             ORDER BY sb.id DESC
             LIMIT 1
           ) AS last_center
    FROM player_profiles pp
    LEFT JOIN player_guardians pg ON pg.player_id = pp.id AND pg.is_primary = 1
    LEFT JOIN users gu ON gu.id = pg.parent_user_id
    ORDER BY pp.id
  `);
  res.json(rows.map((r) => ({
    player: r.player.trim(),
    age: Number(r.age),
    guardian: r.guardian || '',
    passport: r.passport || '',
    lastCenter: (r.last_center || '').replace(/^SKY\s+/, ''),
  })));
}));

// ---- Payments ----
router.get('/payments', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT pt.id, u.full_name AS parent, pl.name AS passport,
           pt.amount_minor, DATE_FORMAT(pt.created_at,'%b %d, %Y') AS date, pt.status
    FROM payment_transactions pt
    JOIN orders o ON o.id = pt.order_id
    JOIN users u ON u.id = o.parent_user_id
    JOIN passport_plan_versions pv ON pv.id = o.plan_version_id
    JOIN passport_plans pl ON pl.id = pv.plan_id
    ORDER BY pt.id DESC
  `);
  res.json(rows.map((r) => ({
    id: `TXN-${String(9000 + r.id)}`,
    parent: r.parent,
    passport: r.passport,
    amount: Number(r.amount_minor) / 100,
    date: r.date,
    status: r.status,
  })));
}));

// ---- Features ----
router.get('/features', asyncHandler(async (_req, res) => {
  const flags = await query(`SELECT id, feature_code AS code, description AS name, default_enabled FROM feature_flags ORDER BY id`);
  const overrides = await query(`SELECT feature_flag_id, surface, enabled FROM feature_flag_overrides WHERE scope_type = 'global'`);
  const byFlag = new Map();
  for (const o of overrides) {
    if (!byFlag.has(o.feature_flag_id)) byFlag.set(o.feature_flag_id, {});
    byFlag.get(o.feature_flag_id)[o.surface] = !!o.enabled;
  }
  res.json(flags.map((f) => {
    const o = byFlag.get(f.id) || {};
    return {
      id: f.code,
      name: f.name || f.code,
      parent: o.parent ?? !!f.default_enabled,
      coach: o.coach ?? false,
      web: o.web ?? false,
      admin: o.admin ?? true,
    };
  }));
}));

// ---- Assessments ----
router.get('/assessments/templates', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT t.name, s.name AS sport, t.status,
           v.version_number,
           JSON_LENGTH(v.questions_json) AS q
    FROM assessment_templates t
    JOIN sports s ON s.id = t.sport_id
    JOIN assessment_template_versions v ON v.template_id = t.id
    WHERE v.version_number = (
      SELECT MAX(v2.version_number) FROM assessment_template_versions v2 WHERE v2.template_id = t.id
    )
    ORDER BY t.id
  `);
  res.json(rows.map((r) => ({
    title: r.name,
    sport: r.sport,
    q: Number(r.q || 0),
    version: Number(r.version_number),
    status: r.status,
  })));
}));

// ---- CMS ----
router.get('/cms/pages', asyncHandler(async (_req, res) => {
  const rows = await query(`SELECT id, slug, title, content_json, status, published_at FROM cms_pages ORDER BY id`);
  res.json(rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    content: typeof r.content_json === 'string' ? JSON.parse(r.content_json) : r.content_json,
    status: r.status,
    publishedAt: r.published_at,
  })));
}));

// ---- Audit ----
router.get('/audit-logs', asyncHandler(async (_req, res) => {
  const rows = await query(`
    SELECT a.action,
           COALESCE(JSON_UNQUOTE(JSON_EXTRACT(a.new_values_json,'$.title')),
                    JSON_UNQUOTE(JSON_EXTRACT(a.new_values_json,'$.center')),
                    JSON_UNQUOTE(JSON_EXTRACT(a.new_values_json,'$.plan')),
                    JSON_UNQUOTE(JSON_EXTRACT(a.new_values_json,'$.name')),
                    a.entity_type) AS entity,
           COALESCE(u.full_name, 'System') AS actor,
           CASE
             WHEN a.created_at > DATE_SUB(NOW(3), INTERVAL 1 HOUR)
               THEN CONCAT(TIMESTAMPDIFF(MINUTE, a.created_at, NOW(3)), ' min ago')
             WHEN a.created_at > DATE_SUB(NOW(3), INTERVAL 1 DAY) THEN 'Yesterday'
             ELSE DATE_FORMAT(a.created_at, '%b %d')
           END AS time_label
    FROM audit_logs a
    LEFT JOIN users u ON u.id = a.actor_user_id
    ORDER BY a.id DESC
    LIMIT 50
  `);
  res.json(rows.map((r) => ({
    action: r.action.replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    entity: r.entity,
    by: r.actor,
    time: r.time_label,
  })));
}));

// ---- Dashboard summary ----
router.get('/dashboard/summary', asyncHandler(async (_req, res) => {
  const centers = await query(`SELECT COUNT(*) AS n FROM centers WHERE status='Active'`);
  const passports = await query(`SELECT COUNT(*) AS n FROM player_passports WHERE status='Active'`);
  const bookings = await query(`SELECT COUNT(*) AS n FROM session_bookings WHERE status IN ('Confirmed','Attended')`);
  const revenue = await query(`SELECT COALESCE(SUM(amount_minor),0) AS n FROM payment_transactions WHERE status='Successful'`);
  res.json({
    activeCenters: Number(centers[0].n),
    activePassports: Number(passports[0].n),
    sessionBookings: Number(bookings[0].n),
    revenueMinor: Number(revenue[0].n),
  });
}));

export default router;
