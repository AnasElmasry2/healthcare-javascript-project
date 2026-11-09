const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createpool({
    host: 'localhost',
    port : 3306,
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'HEALTHCARE'
  
})
const createUsersTable = ` CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, 
    role ENUM('user', 'admin') DEFAULT 'user', 
    Manager_ID INT NULL,
    FOREIGN KEY (Manager_ID) REFERENCES users(id)
);`;



module.exports = { db, createUsersTable } 