const Database = require("better-sqlite3");
const path = require("path");

// --test 붙었는지 체크
const isTest = process.argv.includes("--test");
const dbName = isTest ? "game-test.db" : "game.db";

const db = new Database(path.join(__dirname, dbName));

// 유저 테이블
db.exec(`
    CREATE TABLE IF NOT EXISTS user (
        user_id TEXT PRIMARY KEY,
        money INTEGER DEFAULT 1000,
        daily_last_reset INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0
    )
`);

// bank 테이블
db.exec(`
    CREATE TABLE IF NOT EXISTS bank (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount INTEGER DEFAULT 0,
        failed_attempts INTEGER DEFAULT 0
    )
`);

// 데이터 없으면 초기화
const bankRow = db.prepare("SELECT * FROM bank").get();
if (!bankRow) {
  db.prepare("INSERT INTO bank (amount, failed_attempts) VALUES (0, 0)").run();
}

console.log(`✅ Connect Database Success! (${dbName})`);

module.exports = db;
