import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "votes.db");

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE (user_id, item_id)
  );
`);

function columnExists(table, name) {
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .some((col) => col.name === name);
}

if (!columnExists("items", "image_url")) {
  db.exec(`ALTER TABLE items ADD COLUMN image_url TEXT`);
  db.exec(
    `UPDATE items SET image_url = 'https://picsum.photos/seed/item-' || id || '/400/500' WHERE image_url IS NULL`
  );
}

if (columnExists("votes", "item_id") && !columnExists("votes", "user_id")) {
  db.exec(`ALTER TABLE votes ADD COLUMN user_id INTEGER REFERENCES users(id)`);
  db.exec(`DELETE FROM votes WHERE user_id IS NULL`);
}

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_user_item ON votes(user_id, item_id);
`);

export default db;
