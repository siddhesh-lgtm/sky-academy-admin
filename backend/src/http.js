export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const httpError = (status, message) =>
  Object.assign(new Error(message), { status });

export const asString = (value, max = 200) =>
  typeof value === 'string' && value.trim() && value.length <= max ? value.trim() : null;

export async function writeAudit(dbExecute, { actorUserId = null, action, entityType, entityId = null, oldValues = null, newValues = null, ip = null }) {
  await dbExecute(
    `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, old_values_json, new_values_json, ip_address)
     VALUES (?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), ?)`,
    [
      actorUserId,
      action,
      entityType,
      entityId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ip,
    ],
  );
}
