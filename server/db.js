import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "data", "votes.db");

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (item_id) REFERENCES items(id)
  );
`);

const itemCount = db.prepare("SELECT COUNT(*) AS count FROM items").get().count;

if (itemCount === 0) {
  const insert = db.prepare(
    "INSERT INTO items (id, title, description) VALUES (?, ?, ?)"
  );
  const seedItems = [
    [1, "Item 1", "First sample item"],
    [2, "Item 2", "Second sample item"],
    [3, "Item 3", "Third sample item"],
  ];
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(...row);
  });
  insertMany(seedItems);
}

export default db;
