const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'tutor_portal.db');

let db;

// Load or create the database file
async function initDb() {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // Save helper — writes db back to disk after every change
    db._save = () => {
        const data = db.export();
        fs.writeFileSync(DB_PATH, Buffer.from(data));
    };

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS members (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            email       TEXT NOT NULL UNIQUE,
            phone       TEXT,
            grad_year   TEXT NOT NULL,
            affiliation TEXT NOT NULL,
            password    TEXT NOT NULL,
            created_at  DATETIME DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS products (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id     TEXT NOT NULL UNIQUE,
            name        TEXT NOT NULL,
            description TEXT,
            email       TEXT NOT NULL,
            price       REAL NOT NULL,
            hours       TEXT,
            created_at  DATETIME DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS billing (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name    TEXT NOT NULL,
            student_email   TEXT NOT NULL,
            payment_method  TEXT NOT NULL,
            card_number     TEXT NOT NULL,
            cart_items      TEXT,
            created_at      DATETIME DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS returns (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            reason       TEXT NOT NULL,
            condition_   TEXT NOT NULL,
            status       TEXT NOT NULL DEFAULT 'Pending',
            created_at   DATETIME DEFAULT (datetime('now'))
        );
    `);
    db._save();
}

// mysql2-compatible async query interface
const dbWrapper = {
    query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            if (!db) return reject(new Error('Database not initialized'));
            try {
                const upper = sql.trim().toUpperCase();
                if (upper.startsWith('SELECT')) {
                    const stmt = db.prepare(sql);
                    stmt.bind(params);
                    const rows = [];
                    while (stmt.step()) {
                        rows.push(stmt.getAsObject());
                    }
                    stmt.free();
                    resolve([rows]);
                } else {
                    db.run(sql, params);
                    db._save();
                    const lastId = db.exec('SELECT last_insert_rowid() as id')[0];
                    const insertId = lastId ? lastId.values[0][0] : 0;
                    const changes = db.exec('SELECT changes() as c')[0];
                    const affectedRows = changes ? changes.values[0][0] : 0;
                    resolve([{ insertId, affectedRows }]);
                }
            } catch (err) {
                if (err.message && err.message.includes('UNIQUE constraint failed')) {
                    err.code = 'ER_DUP_ENTRY';
                }
                reject(err);
            }
        });
    },
    init: initDb
};

module.exports = dbWrapper;
