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



module.exports = { db }; 