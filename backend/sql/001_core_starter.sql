-- Core-admin starter only; not the complete SKY Academy 27/40 table schema.
CREATE DATABASE IF NOT EXISTS sky_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sky_academy;
CREATE TABLE IF NOT EXISTS centers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  city VARCHAR(100) NOT NULL,
  area VARCHAR(120) NULL,
  address VARCHAR(500) NOT NULL,
  status ENUM('Active','Pending','Suspended') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_center_city_status (city,status)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS passport_plans (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  duration INT UNSIGNED NOT NULL,
  credits INT UNSIGNED NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  access_type ENUM('All eligible centers','Selected centers','Selected city') NOT NULL DEFAULT 'All eligible centers',
  status ENUM('Draft','Active') NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS training_sessions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  sport VARCHAR(80) NOT NULL,
  center_id BIGINT UNSIGNED NOT NULL,
  coach_name VARCHAR(150) NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  capacity INT UNSIGNED NOT NULL,
  booked INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('Open','Full','Completed','Cancelled') NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_center FOREIGN KEY (center_id) REFERENCES centers(id),
  CONSTRAINT chk_positive_capacity CHECK (capacity>0),
  CONSTRAINT chk_booked_capacity CHECK (booked<=capacity),
  INDEX idx_session_date_center(session_date,center_id)
) ENGINE=InnoDB;
