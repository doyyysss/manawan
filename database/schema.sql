-- Import this file in phpMyAdmin (XAMPP)
-- Database: internship_db

CREATE DATABASE IF NOT EXISTS internship_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE internship_db;

-- Admin login
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin account is created below.
-- After import, open: http://localhost/internship/api/setup_admin.php
-- Then login with username: admin  password: admin123

INSERT IGNORE INTO admins (username, password) VALUES
('admin', '$2y$10$placeholder');

-- Feature 1: Student profiles
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  id_no VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  course VARCHAR(120) NOT NULL,
  year_level VARCHAR(30) NOT NULL,
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Feature 3: Companies (created before placements)
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address VARCHAR(200) NOT NULL,
  vacancy VARCHAR(120) NOT NULL,
  slots INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Feature 2: Placements
CREATE TABLE IF NOT EXISTS placements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  company_id INT NOT NULL,
  position VARCHAR(120) NOT NULL,
  application_date DATE NOT NULL,
  approval ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  status ENUM('Applied', 'Interview', 'Confirmed', 'Completed') NOT NULL DEFAULT 'Applied',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Feature 4: Progress monitoring
CREATE TABLE IF NOT EXISTS progress_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  week_label VARCHAR(80) NOT NULL,
  attendance INT NOT NULL DEFAULT 0,
  supervisor_status ENUM('On Track', 'Needs Improvement', 'Excellent') NOT NULL DEFAULT 'On Track',
  weekly_report TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Feature 5: Evaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  supervisor_name VARCHAR(100) NOT NULL,
  rating DECIMAL(3,1) NOT NULL,
  final_grade VARCHAR(20) NOT NULL,
  report_status ENUM('Draft', 'Submitted', 'Archived') NOT NULL DEFAULT 'Draft',
  evaluation_comments TEXT NOT NULL,
  final_report TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
