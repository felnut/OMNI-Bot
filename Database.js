const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "game.db"));

db.exec(`
    CREATE TABLE IF NOT EXISTS user (
        user_id TEXT PRIMARY KEY,
        money INTEGER DEFAULT 1000,
        daily_last_reset INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0
    )
`);

console.log("Connect Database Success.");

module.exports = db;
