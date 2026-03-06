const path = require("path");
const Database = require("better-sqlite3");

// Store DB in project directory (local). On Railway, use a persistent volume path via DB_PATH.
const dbPath = process.env.DB_PATH || path.join(process.cwd(), "ssff.db");
const db = new Database(dbPath);

// Basic pragmas
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---- Tables ----

// Server -> league_id mapping
db.exec(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    league_id TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

// Discord user -> Sleeper user mapping
db.exec(`
  CREATE TABLE IF NOT EXISTS user_links (
    discord_user_id TEXT PRIMARY KEY,
    sleeper_user_id TEXT NOT NULL,
    sleeper_username TEXT NOT NULL,
    linked_at INTEGER NOT NULL
  );
`);

// Command history / ratings
db.exec(`
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    league_id TEXT,
    command TEXT NOT NULL,
    recommendation_text TEXT NOT NULL,
    model_score INTEGER NOT NULL,
    conservative_score INTEGER,
    aggressive_score INTEGER,
    user_score INTEGER,
    created_at INTEGER NOT NULL
  );
`);

module.exports = db;