const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createPool({
    host: '127.0.0.1',
    port : 3306,
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

  
})

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'admin') NOT NULL DEFAULT 'patient',
    status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) 
`;

const createClinicsTable = `
  CREATE TABLE IF NOT EXISTS clinics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
  )
`;

const createSpecialtiesTable = `
  CREATE TABLE IF NOT EXISTS specialties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
  )
`;

const createDoctorsTable = `
  CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    specialty_id INT NOT NULL,
    bio TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id)
  )
`;

const createDoctorClinicsTable = `
  CREATE TABLE IF NOT EXISTS doctor_clinics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    clinic_id INT NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    UNIQUE (doctor_id, clinic_id)
  )
`;

const createSchedulesTable = `
  CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_clinic_id INT NOT NULL,
    day_of_week INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_minutes INT NOT NULL,
    FOREIGN KEY (doctor_clinic_id) REFERENCES doctor_clinics(id),
    CHECK (day_of_week BETWEEN 0 AND 6),
    CHECK (end_time > start_time),
    CHECK (slot_minutes > 0)
  )
`;

const createAppointmentsTable = `
  CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_clinic_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('booked', 'completed', 'cancelled')
      NOT NULL DEFAULT 'booked',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_clinic_id) REFERENCES doctor_clinics(id),
    CHECK (end_time > start_time),
    INDEX idx_appointment_slot
      (doctor_clinic_id, appointment_date, start_time, status),
    INDEX idx_patient_appointments
      (patient_id, appointment_date)
  )
`;

const createRatingsTable = `
  CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    stars INT NOT NULL,
    status ENUM('visible', 'hidden')
      NOT NULL DEFAULT 'visible',
    moderation_reason VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    CHECK (stars BETWEEN 1 AND 5),
    INDEX idx_doctor_ratings (doctor_id, status)
  )
`;

const createRemindersTable = `
  CREATE TABLE IF NOT EXISTS reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    patient_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    remind_at DATETIME NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (patient_id) REFERENCES users(id),
    INDEX idx_patient_reminders (patient_id, remind_at)
  )
`;

const createDoctorDayLocksTable = `
  CREATE TABLE IF NOT EXISTS doctor_day_locks (
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    PRIMARY KEY (doctor_id, appointment_date),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  )
`;

const createAuthenticationLogsTable = `
  CREATE TABLE IF NOT EXISTS authentication_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_type VARCHAR(30) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_auth_logs_date (created_at)
  )
`;

const createReminderSettingsTable = `
  CREATE TABLE IF NOT EXISTS reminder_settings (
    id INT PRIMARY KEY,
    lead_hours INT NOT NULL DEFAULT 24,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (lead_hours > 0)
  )
`;


module.exports = {
  db,
  createUsersTable,
  createClinicsTable,
  createSpecialtiesTable,
  createDoctorsTable,
  createDoctorClinicsTable,
  createSchedulesTable,
  createAppointmentsTable,
  createRatingsTable,
  createRemindersTable,
  createDoctorDayLocksTable,
  createAuthenticationLogsTable,
  createReminderSettingsTable
};