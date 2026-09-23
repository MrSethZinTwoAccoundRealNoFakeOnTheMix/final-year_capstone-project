const Database = require('better-sqlite3');
const path = require('path');

// Database lives at the project root (same level as package.json)
const DB_PATH = path.join(__dirname, '../../shop.db');

const db = new Database(DB_PATH);

// --- Performance & Concurrency PRAGMAs ---
// WAL: readers never block writers, writers never block readers
db.pragma('journal_mode = WAL');
// Wait up to 5s on a busy lock before throwing (instead of failing immediately)
db.pragma('busy_timeout = 5000');
// Enforce foreign key constraints at the database level
db.pragma('foreign_keys = ON');
// Faster disk writes, safe under WAL mode
db.pragma('synchronous = NORMAL');

module.exports = db;
