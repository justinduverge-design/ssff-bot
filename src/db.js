const path = require("path");
const Database = require("better-sqlite3");

// Store DB in project directory.
// NOTE: On Render free tier, local disk may reset on redeploy unless you use a persistent disk.
const dbPath = process.env.DB_PATH || path.join(process.cwd(), "ssff.db");
const db = new Database(dbPath);

// Basic pragmas (safe defaults)
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---- Tables ----
db.exec(`
  CREATE TABLE IF NOT EXISTS user_links (
    discord_user_id TEXT PRIMARY KEY,
    sleeper_user_id TEXT NOT NULL,
    sleeper_username TEXT NOT NULL,
    linked_at INTEGER NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    league_id TEXT,
    command TEXT NOT NULL,                 -- e.g. "ssff"
    recommendation_text TEXT NOT NULL,     -- the one-sentence move
    model_score INTEGER NOT NULL,          -- 0-100
    conservative_score INTEGER,            -- 0-100 (optional)
    aggressive_score INTEGER,              -- 0-100 (optional)
    user_score INTEGER,                    -- 0-10  (optional)
    created_at INTEGER NOT NULL
  );
`);

module.exports = db;