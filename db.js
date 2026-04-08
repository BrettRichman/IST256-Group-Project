const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: '',         // Individual MySQL username
    password: '',         // Individual MySQL password
    database: 'psu_tutor_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();

module.exports = db;
