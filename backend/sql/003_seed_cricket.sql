USE sky_academy;

-- Roles
INSERT INTO roles (id, code, name, surface, is_active) VALUES
(1,'sky_super_admin','SKY Super Admin','admin',1),
(2,'finance_accounts','Finance / Accounts','admin',1),
(3,'center_admin','Center Admin','admin',1),
(4,'head_coach','Head Coach','coach',1),
(5,'coach','Coach','coach',1),
(6,'parent','Parent / Guardian','parent',1);

-- Permissions (admin modules)
INSERT INTO permissions (code, module_code, action_code, description) VALUES
('centers.read','centers','read','View centers'),
('centers.write','centers','write','Create/update centers'),
('passports.read','passports','read','View passport plans'),
('passports.write','passports','write','Create passport plans'),
('sessions.read','sessions','read','View sessions'),
('sessions.write','sessions','write','Create sessions'),
('bookings.read','bookings','read','View bookings'),
('payments.read','payments','read','View payments'),
('features.read','features','read','View feature flags'),
('cms.write','cms','write','Edit CMS pages'),
('audit.read','audit','read','View audit logs');

INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE module_code IN ('passports','payments','audit');
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE module_code IN ('centers','sessions','bookings','passports');

-- Users (password_hash left null for local demo)
INSERT INTO users (id, full_name, email, mobile_e164, status) VALUES
(1,'SKY Platform Owner','superadmin@skyacademy.demo','+919800000001','active'),
(2,'Sneha Joshi','finance@skyacademy.demo','+919800000002','active'),
(3,'Vikram Desai','vikram@skyacademy.demo','+919800000003','active'),
(4,'Rahul Sharma','rahul@skyacademy.demo','+919800000004','active'),
(5,'Priya Nair','priya@skyacademy.demo','+919800000005','active'),
(6,'Aditya Mehta','aditya@skyacademy.demo','+919800000006','active'),
(7,'Sameer Patil','sameer@skyacademy.demo','+919800000007','active'),
(8,'Neha Patel','neha@example.com','+919800000008','active'),
(9,'Pooja Shah','pooja@example.com','+919800000009','active'),
(10,'Anita Rao','anita@example.com','+919800000010','active'),
(11,'Kiran Desai','kiran@example.com','+919800000011','active'),
(12,'Meera Singh','meera@example.com','+919800000012','active');

INSERT INTO user_roles (user_id, role_id) VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),(6,5),(7,5),(8,6),(9,6),(10,6),(11,6),(12,6);

-- Sport: Cricket only
INSERT INTO sports (id, code, name, status) VALUES (1,'cricket','Cricket','active');

-- Centers
INSERT INTO centers (id, code, name, address, city, status, configuration_json) VALUES
(1,'AND-CRI','SKY Andheri Cricket Hub','Andheri West, Mumbai','Mumbai','Active',JSON_OBJECT('area','Andheri West','capacity',18)),
(2,'POW-CRI','SKY Powai Cricket Arena','Hiranandani Gardens, Powai','Mumbai','Active',JSON_OBJECT('area','Powai','capacity',16)),
(3,'THN-CRI','SKY Thane Cricket Academy','Ghodbunder Road, Thane','Thane','Active',JSON_OBJECT('area','Ghodbunder Road','capacity',20)),
(4,'BAN-CRI','SKY Bandra Cricket Center','Bandra West, Mumbai','Mumbai','Active',JSON_OBJECT('area','Bandra West','capacity',16)),
(5,'NMM-CRI','SKY Navi Mumbai Cricket','Vashi, Navi Mumbai','Navi Mumbai','Pending',JSON_OBJECT('area','Vashi','capacity',14));

INSERT INTO staff_center_assignments (user_id, center_id, role_id) VALUES
(3,1,3),(4,1,4),(5,2,5),(6,2,5),(6,4,5),(7,3,5);

INSERT INTO center_applications (id, applicant_name, applicant_mobile, center_name, application_json, status) VALUES
(1042,'Nilesh Pawar','+919811111111','SKY Navi Mumbai Cricket',JSON_OBJECT('city','Navi Mumbai'),'Pending checker'),
(1041,'Akash Shah','+919822222222','SKY Chembur Cricket Arena',JSON_OBJECT('city','Mumbai'),'Maker review'),
(1040,'Rehan Khan','+919833333333','SKY Dadar Cricket',JSON_OBJECT('city','Mumbai'),'Returned');

-- Players & guardians
INSERT INTO player_profiles (id, first_name, last_name, date_of_birth, status) VALUES
(1,'Aarav','Patel','2016-03-12','active'),
(2,'Riya','Shah','2017-07-21','active'),
(3,'Vivaan','Rao','2015-11-02','active'),
(4,'Anaya','Desai','2018-01-18','active'),
(5,'Kabir','Singh','2014-09-09','active');

INSERT INTO player_guardians (player_id, parent_user_id, relationship, can_book, can_pay, is_primary, status) VALUES
(1,8,'mother',1,1,1,'active'),
(2,9,'mother',1,1,1,'active'),
(3,10,'mother',1,1,1,'active'),
(4,11,'father',1,1,1,'active'),
(5,12,'mother',1,1,1,'active');

-- Passport plans + versions
INSERT INTO passport_plans (id, code, name, passport_type, status) VALUES
(1,'TRIAL','Trial Passport','trial','Active'),
(2,'STARTER','SKY Starter','standard','Active'),
(3,'PLUS','SKY Plus','standard','Active'),
(4,'PRO','SKY Pro','premium','Active');

INSERT INTO passport_plan_versions (id, plan_id, version_number, price_minor, currency, duration_days, allowance_type, included_sessions, rules_json, published_at) VALUES
(1,1,1,0,'INR',7,'credits',1,JSON_OBJECT('access','Selected centers'),NOW(3)),
(2,2,1,249900,'INR',30,'credits',5,JSON_OBJECT('access','All eligible centers'),NOW(3)),
(3,3,1,549900,'INR',60,'credits',12,JSON_OBJECT('access','All eligible centers'),NOW(3)),
(4,4,1,849900,'INR',90,'credits',20,JSON_OBJECT('access','All eligible centers'),NOW(3));

INSERT INTO passport_access_rules (plan_version_id, scope_type, target_code, rule_action) VALUES
(1,'selected_centers',NULL,'allow'),
(2,'all_eligible',NULL,'allow'),
(3,'all_eligible',NULL,'allow'),
(4,'all_eligible',NULL,'allow');

-- Orders + player passports
INSERT INTO orders (id, order_number, parent_user_id, player_id, plan_version_id, amount_minor, currency, status) VALUES
(1,'ORD-0921',8,1,2,249900,'INR','paid'),
(2,'ORD-0920',9,2,3,549900,'INR','paid'),
(3,'ORD-0919',11,4,4,849900,'INR','paid'),
(4,'ORD-0918',10,3,2,249900,'INR','refund_requested'),
(5,'ORD-0917',12,5,3,549900,'INR','failed');

INSERT INTO player_passports (id, player_id, plan_version_id, purchased_by_user_id, order_id, starts_at, expires_at, status, available_credits, reserved_credits, consumed_credits) VALUES
(1,1,2,8,1,NOW(3),DATE_ADD(NOW(3), INTERVAL 30 DAY),'Active',4,1,0),
(2,2,3,9,2,NOW(3),DATE_ADD(NOW(3), INTERVAL 60 DAY),'Active',11,1,0),
(3,3,2,10,4,NOW(3),DATE_ADD(NOW(3), INTERVAL 30 DAY),'Active',4,0,1),
(4,4,4,11,3,NOW(3),DATE_ADD(NOW(3), INTERVAL 90 DAY),'Active',19,1,0),
(5,5,3,12,5,NOW(3),DATE_ADD(NOW(3), INTERVAL 60 DAY),'Cancelled',0,0,0);

INSERT INTO payment_transactions (id, order_id, gateway, gateway_reference, amount_minor, status) VALUES
(1,1,'razorpay','pay_demo_0921',249900,'Successful'),
(2,2,'razorpay','pay_demo_0920',549900,'Successful'),
(3,3,'razorpay','pay_demo_0919',849900,'Successful'),
(4,4,'razorpay','pay_demo_0918',249900,'Refund Requested'),
(5,5,'razorpay','pay_demo_0917',549900,'Failed');

-- Training sessions (cricket)
INSERT INTO training_sessions (id, center_id, sport_id, title, starts_at, ends_at, booking_opens_at, booking_closes_at, max_players, booked_count, minimum_age, maximum_age, credit_cost, status) VALUES
(101,1,1,'Cricket Fundamentals U12','2026-11-07 07:00:00.000','2026-11-07 08:30:00.000','2026-11-01 00:00:00.000','2026-11-07 06:00:00.000',12,9,8,12,1,'Open'),
(102,2,1,'Batting Technique U10','2026-11-07 09:00:00.000','2026-11-07 10:30:00.000','2026-11-01 00:00:00.000','2026-11-07 08:00:00.000',12,12,8,10,1,'Full'),
(103,2,1,'Bowling Basics U11','2026-11-08 17:00:00.000','2026-11-08 18:30:00.000','2026-11-01 00:00:00.000','2026-11-08 16:00:00.000',10,6,8,11,1,'Open'),
(104,3,1,'Cricket Match Practice','2026-11-08 08:00:00.000','2026-11-08 10:00:00.000','2026-11-01 00:00:00.000','2026-11-08 07:00:00.000',16,11,8,12,1,'Open'),
(105,4,1,'Fielding & Fitness U12','2026-11-09 18:00:00.000','2026-11-09 19:30:00.000','2026-11-01 00:00:00.000','2026-11-09 17:00:00.000',14,8,8,12,1,'Open');

INSERT INTO session_coaches (session_id, coach_user_id, assignment_type) VALUES
(101,4,'primary'),(102,6,'primary'),(103,5,'primary'),(104,7,'primary'),(105,6,'primary');

INSERT INTO session_bookings (id, session_id, player_id, player_passport_id, booked_by_user_id, credits_reserved, status) VALUES
(1001,101,1,1,8,1,'Confirmed'),
(1002,102,2,2,9,1,'Confirmed'),
(1003,103,3,3,10,1,'Attended'),
(1004,104,4,4,11,1,'Confirmed'),
(1005,105,5,5,12,1,'Cancelled');

UPDATE session_bookings SET cancelled_at = NOW(3) WHERE id = 1005;

INSERT INTO passport_credit_ledger (player_passport_id, booking_id, event_type, available_delta, reserved_delta, consumed_delta, idempotency_key) VALUES
(1,1001,'reserve',-1,1,0,'ledger-1001-reserve'),
(2,1002,'reserve',-1,1,0,'ledger-1002-reserve'),
(3,1003,'consume',0,-1,1,'ledger-1003-consume'),
(4,1004,'reserve',-1,1,0,'ledger-1004-reserve'),
(5,1005,'release',1,-1,0,'ledger-1005-release');

INSERT INTO session_attendance (booking_id, status, marked_by_user_id, notes) VALUES
(1003,'Attended',5,'Good bowling progress');

-- Assessments
INSERT INTO assessment_templates (id, sport_id, name, created_by_user_id, status) VALUES
(1,1,'Cricket Fundamentals',1,'Published'),
(2,1,'Batting Technique',1,'Published'),
(3,1,'Bowling & Fielding',1,'Published');

INSERT INTO assessment_template_versions (id, template_id, version_number, questions_json, published_at) VALUES
(1,1,3,JSON_ARRAY(JSON_OBJECT('key','stance','label','Stance'),JSON_OBJECT('key','grip','label','Grip')),NOW(3)),
(2,2,2,JSON_ARRAY(JSON_OBJECT('key','front_foot','label','Front foot drive')),NOW(3)),
(3,3,1,JSON_ARRAY(JSON_OBJECT('key','line_length','label','Line & length')),NOW(3));

-- Feature flags
INSERT INTO feature_flags (module_code, feature_code, default_enabled, description) VALUES
('passport','passport.purchase',1,'Passport Purchase'),
('session','session.booking',1,'Session Booking'),
('session','session.evidence',1,'Coach Photo / Video Evidence'),
('assessments','assessments',1,'Player Assessments'),
('session','session.waitlist',0,'Session Waitlist'),
('centers','centers.directory',1,'Center Directory'),
('tournaments','tournaments',0,'Tournaments');

INSERT INTO feature_flag_overrides (feature_flag_id, surface, scope_type, scope_key, enabled, updated_by_user_id)
SELECT id, 'parent', 'global', '*', default_enabled, 1 FROM feature_flags;
INSERT INTO feature_flag_overrides (feature_flag_id, surface, scope_type, scope_key, enabled, updated_by_user_id)
SELECT id, 'coach', 'global', '*', IF(feature_code IN ('session.booking','session.evidence','assessments'), 1, 0), 1 FROM feature_flags;
INSERT INTO feature_flag_overrides (feature_flag_id, surface, scope_type, scope_key, enabled, updated_by_user_id)
SELECT id, 'web', 'global', '*', IF(feature_code IN ('passport.purchase','centers.directory'), 1, 0), 1 FROM feature_flags;
INSERT INTO feature_flag_overrides (feature_flag_id, surface, scope_type, scope_key, enabled, updated_by_user_id)
SELECT id, 'admin', 'global', '*', 1, 1 FROM feature_flags;

INSERT INTO cms_pages (slug, title, content_json, status, published_at, updated_by_user_id) VALUES
('home','SKY Academy Homepage',JSON_OBJECT('sections',JSON_ARRAY('Hero','About','Centers','Passports','Programs','FAQ','Contact')),'Published',NOW(3),1);

INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, new_values_json, ip_address) VALUES
(NULL,'Center application submitted','center_application',1042,JSON_OBJECT('center','SKY Navi Mumbai Cricket'),'127.0.0.1'),
(8,'Passport purchased','player_passport',1,JSON_OBJECT('plan','SKY Starter','player','Aarav Patel'),'127.0.0.1'),
(4,'Session roster updated','training_session',101,JSON_OBJECT('title','Cricket Fundamentals U12'),'127.0.0.1'),
(1,'Assessment template published','assessment_template',2,JSON_OBJECT('name','Batting Technique'),'127.0.0.1');
