-- SKY Academy — full 35-table MySQL schema (9 modules)
-- Source: SKY_Academy_Simple_35_Table_Schema

CREATE DATABASE IF NOT EXISTS sky_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sky_academy;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS cms_pages;
DROP TABLE IF EXISTS feature_flag_overrides;
DROP TABLE IF EXISTS feature_flags;
DROP TABLE IF EXISTS assessment_answers;
DROP TABLE IF EXISTS player_assessments;
DROP TABLE IF EXISTS assessment_template_versions;
DROP TABLE IF EXISTS assessment_templates;
DROP TABLE IF EXISTS refunds;
DROP TABLE IF EXISTS payment_webhook_events;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS session_evidence;
DROP TABLE IF EXISTS session_attendance;
DROP TABLE IF EXISTS passport_credit_ledger;
DROP TABLE IF EXISTS session_bookings;
DROP TABLE IF EXISTS session_coaches;
DROP TABLE IF EXISTS training_sessions;
DROP TABLE IF EXISTS player_passports;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS passport_access_rules;
DROP TABLE IF EXISTS passport_plan_versions;
DROP TABLE IF EXISTS passport_plans;
DROP TABLE IF EXISTS guardian_consents;
DROP TABLE IF EXISTS player_guardians;
DROP TABLE IF EXISTS player_profiles;
DROP TABLE IF EXISTS staff_center_assignments;
DROP TABLE IF EXISTS center_application_reviews;
DROP TABLE IF EXISTS center_applications;
DROP TABLE IF EXISTS sports;
DROP TABLE IF EXISTS centers;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 01 Authentication & RBAC
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NULL,
  mobile_e164 VARCHAR(20) NULL,
  password_hash VARCHAR(255) NULL,
  profile_json JSON NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_mobile (mobile_e164)
) ENGINE=InnoDB;

CREATE TABLE roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(100) NOT NULL,
  surface VARCHAR(30) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  UNIQUE KEY uq_roles_code (code)
) ENGINE=InnoDB;

CREATE TABLE user_roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id),
  UNIQUE KEY uq_user_role (user_id, role_id)
) ENGINE=InnoDB;

CREATE TABLE permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL,
  module_code VARCHAR(50) NOT NULL,
  action_code VARCHAR(50) NOT NULL,
  description VARCHAR(255) NULL,
  UNIQUE KEY uq_permissions_code (code)
) ENGINE=InnoDB;

CREATE TABLE role_permissions (
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id)
) ENGINE=InnoDB;

-- 02 Centers & Staff
CREATE TABLE centers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(180) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  configuration_json JSON NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_centers_code (code),
  KEY idx_centers_city_status (city, status)
) ENGINE=InnoDB;

CREATE TABLE center_applications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  applicant_user_id BIGINT UNSIGNED NULL,
  applicant_name VARCHAR(150) NOT NULL,
  applicant_mobile VARCHAR(20) NOT NULL,
  center_name VARCHAR(180) NOT NULL,
  application_json JSON NOT NULL,
  status VARCHAR(25) NOT NULL,
  created_center_id BIGINT UNSIGNED NULL,
  submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_capp_user FOREIGN KEY (applicant_user_id) REFERENCES users(id),
  CONSTRAINT fk_capp_center FOREIGN KEY (created_center_id) REFERENCES centers(id)
) ENGINE=InnoDB;

CREATE TABLE center_application_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  reviewer_user_id BIGINT UNSIGNED NOT NULL,
  stage VARCHAR(15) NOT NULL,
  decision VARCHAR(20) NOT NULL,
  remarks TEXT NULL,
  reviewed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_carev_app FOREIGN KEY (application_id) REFERENCES center_applications(id),
  CONSTRAINT fk_carev_user FOREIGN KEY (reviewer_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE staff_center_assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  center_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ended_at DATETIME(3) NULL,
  active_user_key BIGINT UNSIGNED
    GENERATED ALWAYS AS (IF(ended_at IS NULL, user_id, NULL)) STORED,
  CONSTRAINT fk_sca_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_sca_center FOREIGN KEY (center_id) REFERENCES centers(id),
  CONSTRAINT fk_sca_role FOREIGN KEY (role_id) REFERENCES roles(id),
  UNIQUE KEY uq_active_staff (center_id, role_id, active_user_key)
) ENGINE=InnoDB;

CREATE TABLE sports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  UNIQUE KEY uq_sports_code (code)
) ENGINE=InnoDB;

-- 03 Parents & Players
CREATE TABLE player_profiles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NULL,
  date_of_birth DATE NOT NULL,
  profile_json JSON NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE player_guardians (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  player_id BIGINT UNSIGNED NOT NULL,
  parent_user_id BIGINT UNSIGNED NOT NULL,
  relationship VARCHAR(30) NOT NULL,
  can_book BOOLEAN NOT NULL DEFAULT 1,
  can_pay BOOLEAN NOT NULL DEFAULT 1,
  is_primary BOOLEAN NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL,
  CONSTRAINT fk_pg_player FOREIGN KEY (player_id) REFERENCES player_profiles(id),
  CONSTRAINT fk_pg_parent FOREIGN KEY (parent_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE guardian_consents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  player_id BIGINT UNSIGNED NOT NULL,
  guardian_user_id BIGINT UNSIGNED NOT NULL,
  consent_type VARCHAR(50) NOT NULL,
  policy_version VARCHAR(30) NOT NULL,
  granted_at DATETIME(3) NULL,
  revoked_at DATETIME(3) NULL,
  evidence_json JSON NULL,
  CONSTRAINT fk_gc_player FOREIGN KEY (player_id) REFERENCES player_profiles(id),
  CONSTRAINT fk_gc_guardian FOREIGN KEY (guardian_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 04 Passport Management (orders before player_passports)
CREATE TABLE passport_plans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  passport_type VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL,
  UNIQUE KEY uq_passport_plans_code (code)
) ENGINE=InnoDB;

CREATE TABLE passport_plan_versions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  plan_id BIGINT UNSIGNED NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  price_minor BIGINT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  duration_days SMALLINT UNSIGNED NOT NULL,
  allowance_type VARCHAR(15) NOT NULL,
  included_sessions INT UNSIGNED NULL,
  rules_json JSON NOT NULL,
  published_at DATETIME(3) NULL,
  CONSTRAINT fk_ppv_plan FOREIGN KEY (plan_id) REFERENCES passport_plans(id),
  UNIQUE KEY uq_plan_version (plan_id, version_number)
) ENGINE=InnoDB;

CREATE TABLE passport_access_rules (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  plan_version_id BIGINT UNSIGNED NOT NULL,
  scope_type VARCHAR(30) NOT NULL,
  target_code VARCHAR(100) NULL,
  rule_action VARCHAR(15) NOT NULL,
  CONSTRAINT fk_par_version FOREIGN KEY (plan_version_id) REFERENCES passport_plan_versions(id)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(60) NOT NULL,
  parent_user_id BIGINT UNSIGNED NOT NULL,
  player_id BIGINT UNSIGNED NOT NULL,
  plan_version_id BIGINT UNSIGNED NOT NULL,
  amount_minor BIGINT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_orders_number (order_number),
  CONSTRAINT fk_orders_parent FOREIGN KEY (parent_user_id) REFERENCES users(id),
  CONSTRAINT fk_orders_player FOREIGN KEY (player_id) REFERENCES player_profiles(id),
  CONSTRAINT fk_orders_plan_version FOREIGN KEY (plan_version_id) REFERENCES passport_plan_versions(id)
) ENGINE=InnoDB;

CREATE TABLE player_passports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  player_id BIGINT UNSIGNED NOT NULL,
  plan_version_id BIGINT UNSIGNED NOT NULL,
  purchased_by_user_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NULL,
  starts_at DATETIME(3) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  status VARCHAR(20) NOT NULL,
  available_credits INT UNSIGNED NOT NULL DEFAULT 0,
  reserved_credits INT UNSIGNED NOT NULL DEFAULT 0,
  consumed_credits INT UNSIGNED NOT NULL DEFAULT 0,
  expired_credits INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_pp_player FOREIGN KEY (player_id) REFERENCES player_profiles(id),
  CONSTRAINT fk_pp_plan_version FOREIGN KEY (plan_version_id) REFERENCES passport_plan_versions(id),
  CONSTRAINT fk_pp_buyer FOREIGN KEY (purchased_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_pp_order FOREIGN KEY (order_id) REFERENCES orders(id),
  UNIQUE KEY uq_pp_order (order_id)
) ENGINE=InnoDB;

-- 05 Sessions & Bookings
CREATE TABLE training_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  center_id BIGINT UNSIGNED NOT NULL,
  sport_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  starts_at DATETIME(3) NOT NULL,
  ends_at DATETIME(3) NOT NULL,
  booking_opens_at DATETIME(3) NOT NULL,
  booking_closes_at DATETIME(3) NOT NULL,
  max_players SMALLINT UNSIGNED NOT NULL,
  booked_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  minimum_age TINYINT UNSIGNED NULL,
  maximum_age TINYINT UNSIGNED NULL,
  credit_cost SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL,
  CONSTRAINT fk_ts_center FOREIGN KEY (center_id) REFERENCES centers(id),
  CONSTRAINT fk_ts_sport FOREIGN KEY (sport_id) REFERENCES sports(id),
  KEY idx_ts_starts (starts_at, center_id)
) ENGINE=InnoDB;

CREATE TABLE session_coaches (
  session_id BIGINT UNSIGNED NOT NULL,
  coach_user_id BIGINT UNSIGNED NOT NULL,
  assignment_type VARCHAR(20) NOT NULL,
  PRIMARY KEY (session_id, coach_user_id),
  CONSTRAINT fk_sc_session FOREIGN KEY (session_id) REFERENCES training_sessions(id),
  CONSTRAINT fk_sc_coach FOREIGN KEY (coach_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE session_bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,
  player_id BIGINT UNSIGNED NOT NULL,
  player_passport_id BIGINT UNSIGNED NOT NULL,
  booked_by_user_id BIGINT UNSIGNED NOT NULL,
  credits_reserved SMALLINT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL,
  booked_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  cancelled_at DATETIME(3) NULL,
  CONSTRAINT fk_sb_session FOREIGN KEY (session_id) REFERENCES training_sessions(id),
  CONSTRAINT fk_sb_player FOREIGN KEY (player_id) REFERENCES player_profiles(id),
  CONSTRAINT fk_sb_passport FOREIGN KEY (player_passport_id) REFERENCES player_passports(id),
  CONSTRAINT fk_sb_booker FOREIGN KEY (booked_by_user_id) REFERENCES users(id),
  UNIQUE KEY uq_session_player_active (session_id, player_id)
) ENGINE=InnoDB;

CREATE TABLE passport_credit_ledger (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  player_passport_id BIGINT UNSIGNED NOT NULL,
  booking_id BIGINT UNSIGNED NULL,
  event_type VARCHAR(20) NOT NULL,
  available_delta INT NOT NULL DEFAULT 0,
  reserved_delta INT NOT NULL DEFAULT 0,
  consumed_delta INT NOT NULL DEFAULT 0,
  expired_delta INT NOT NULL DEFAULT 0,
  idempotency_key VARCHAR(120) NOT NULL,
  occurred_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_pcl_passport FOREIGN KEY (player_passport_id) REFERENCES player_passports(id),
  CONSTRAINT fk_pcl_booking FOREIGN KEY (booking_id) REFERENCES session_bookings(id),
  UNIQUE KEY uq_pcl_idempotency (idempotency_key)
) ENGINE=InnoDB;

CREATE TABLE session_attendance (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL,
  marked_by_user_id BIGINT UNSIGNED NOT NULL,
  marked_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  notes TEXT NULL,
  CONSTRAINT fk_sa_booking FOREIGN KEY (booking_id) REFERENCES session_bookings(id),
  CONSTRAINT fk_sa_marker FOREIGN KEY (marked_by_user_id) REFERENCES users(id),
  UNIQUE KEY uq_sa_booking (booking_id)
) ENGINE=InnoDB;

CREATE TABLE session_evidence (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT UNSIGNED NOT NULL,
  uploaded_by_user_id BIGINT UNSIGNED NOT NULL,
  media_type VARCHAR(15) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  consent_verified_at DATETIME(3) NULL,
  visibility VARCHAR(20) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_se_session FOREIGN KEY (session_id) REFERENCES training_sessions(id),
  CONSTRAINT fk_se_uploader FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 06 Payments & Refunds
CREATE TABLE payment_transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  gateway VARCHAR(30) NOT NULL,
  gateway_reference VARCHAR(150) NULL,
  amount_minor BIGINT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_pt_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE payment_webhook_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  gateway VARCHAR(30) NOT NULL,
  gateway_event_id VARCHAR(160) NOT NULL,
  event_payload JSON NOT NULL,
  verified BOOLEAN NOT NULL,
  processed_at DATETIME(3) NULL,
  UNIQUE KEY uq_pwe_gateway_event (gateway, gateway_event_id)
) ENGINE=InnoDB;

CREATE TABLE refunds (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  payment_transaction_id BIGINT UNSIGNED NOT NULL,
  amount_minor BIGINT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL,
  requested_by_user_id BIGINT UNSIGNED NOT NULL,
  processed_by_user_id BIGINT UNSIGNED NULL,
  gateway_refund_reference VARCHAR(150) NULL,
  CONSTRAINT fk_refunds_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_refunds_txn FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id),
  CONSTRAINT fk_refunds_requester FOREIGN KEY (requested_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_refunds_processor FOREIGN KEY (processed_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 07 Assessments
CREATE TABLE assessment_templates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sport_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  created_by_user_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL,
  CONSTRAINT fk_at_sport FOREIGN KEY (sport_id) REFERENCES sports(id),
  CONSTRAINT fk_at_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE assessment_template_versions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_id BIGINT UNSIGNED NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  questions_json JSON NOT NULL,
  published_at DATETIME(3) NULL,
  CONSTRAINT fk_atv_template FOREIGN KEY (template_id) REFERENCES assessment_templates(id),
  UNIQUE KEY uq_template_version (template_id, version_number)
) ENGINE=InnoDB;

CREATE TABLE player_assessments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  player_id BIGINT UNSIGNED NOT NULL,
  session_id BIGINT UNSIGNED NULL,
  coach_user_id BIGINT UNSIGNED NOT NULL,
  template_version_id BIGINT UNSIGNED NOT NULL,
  final_remarks TEXT NOT NULL,
  assessed_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_pa_player FOREIGN KEY (player_id) REFERENCES player_profiles(id),
  CONSTRAINT fk_pa_session FOREIGN KEY (session_id) REFERENCES training_sessions(id),
  CONSTRAINT fk_pa_coach FOREIGN KEY (coach_user_id) REFERENCES users(id),
  CONSTRAINT fk_pa_template_version FOREIGN KEY (template_version_id) REFERENCES assessment_template_versions(id)
) ENGINE=InnoDB;

CREATE TABLE assessment_answers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  assessment_id BIGINT UNSIGNED NOT NULL,
  question_key VARCHAR(100) NOT NULL,
  answer_json JSON NOT NULL,
  weighted_score DECIMAL(8,3) NULL,
  CONSTRAINT fk_aa_assessment FOREIGN KEY (assessment_id) REFERENCES player_assessments(id)
) ENGINE=InnoDB;

-- 08 Dynamic Modules & CMS
CREATE TABLE feature_flags (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  module_code VARCHAR(60) NOT NULL,
  feature_code VARCHAR(100) NOT NULL,
  default_enabled BOOLEAN NOT NULL DEFAULT 0,
  description VARCHAR(255) NULL,
  UNIQUE KEY uq_feature_code (feature_code)
) ENGINE=InnoDB;

CREATE TABLE feature_flag_overrides (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  feature_flag_id BIGINT UNSIGNED NOT NULL,
  surface VARCHAR(30) NOT NULL,
  scope_type VARCHAR(20) NOT NULL,
  scope_key VARCHAR(80) NOT NULL DEFAULT '*',
  enabled BOOLEAN NOT NULL,
  updated_by_user_id BIGINT UNSIGNED NOT NULL,
  CONSTRAINT fk_ffo_flag FOREIGN KEY (feature_flag_id) REFERENCES feature_flags(id),
  CONSTRAINT fk_ffo_user FOREIGN KEY (updated_by_user_id) REFERENCES users(id),
  UNIQUE KEY uq_ffo_scope (feature_flag_id, surface, scope_type, scope_key)
) ENGINE=InnoDB;

CREATE TABLE cms_pages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content_json JSON NOT NULL,
  status VARCHAR(20) NOT NULL,
  published_at DATETIME(3) NULL,
  updated_by_user_id BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_cms_slug (slug),
  CONSTRAINT fk_cms_user FOREIGN KEY (updated_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 09 Audit Logs
CREATE TABLE audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  old_values_json JSON NULL,
  new_values_json JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id),
  KEY idx_audit_entity (entity_type, entity_id),
  KEY idx_audit_created (created_at)
) ENGINE=InnoDB;
