import cors from "cors";
import crypto from "crypto";
import express from "express";
import { optionalSession, requireSession } from "./auth.js";
import db from "./db.js";
import { normalizeUsername } from "./validate.js";

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_DAYS = 30;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/session", (req, res) => {
  const username = normalizeUsername(req.body?.username);
  if (!username) {
    return res.status(400).json({
      error: "Invalid username. Use 2–24 letters, numbers, or underscores.",
    });
  }

  db.prepare("INSERT OR IGNORE INTO users (username) VALUES (?)").run(username);
  const user = db
    .prepare("SELECT id, username FROM users WHERE username = ? COLLATE NOCASE")
    .get(username);

  const sessionId = crypto.randomUUID();
  const expiresAt = db
    .prepare(`SELECT datetime('now', '+' || ? || ' days') AS expires`)
    .get(SESSION_DAYS).expires;

  db.prepare(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(sessionId, user.id, expiresAt);

  res.status(201).json({
    sessionId,
    user: { id: user.id, username: user.username },
  });
});

app.get("/api/me", requireSession, (req, res) => {
  const votes = db
    .prepare(
      `SELECT item_id AS itemId, vote
       FROM votes WHERE user_id = ?
       ORDER BY datetime(created_at) ASC, id ASC`
    )
    .all(req.user.id);

  res.json({ user: req.user, votes });
});

app.delete("/api/session", requireSession, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE id = ?").run(req.sessionId);
  res.json({ ok: true });
});

app.get("/api/items", optionalSession, (req, res) => {
  const items = db
    .prepare(
      "SELECT id, title, description, image_url AS imageUrl FROM items ORDER BY id"
    )
    .all();

  let votedItemIds = [];
  if (req.user) {
    votedItemIds = db
      .prepare("SELECT item_id FROM votes WHERE user_id = ?")
      .all(req.user.id)
      .map((row) => row.item_id);
  }

  res.json({ items, votedItemIds });
});

app.get("/api/results", (_req, res) => {
  const results = db
    .prepare(
      `SELECT
         i.id AS itemId,
         i.title,
         i.image_url AS imageUrl,
         COALESCE(SUM(CASE WHEN v.vote = 'yes' THEN 1 ELSE 0 END), 0) AS yesCount,
         COALESCE(SUM(CASE WHEN v.vote = 'no' THEN 1 ELSE 0 END), 0) AS noCount,
         COUNT(v.id) AS totalVotes
       FROM items i
       LEFT JOIN votes v ON v.item_id = i.id
       GROUP BY i.id, i.title, i.image_url
       ORDER BY i.id`
    )
    .all();
  res.json({ results });
});

app.post("/api/votes", requireSession, (req, res) => {
  const { itemId, vote } = req.body ?? {};

  if (itemId == null || !["yes", "no"].includes(vote)) {
    return res.status(400).json({
      error: "Invalid body. Expected { itemId: number, vote: 'yes' | 'no' }",
    });
  }

  const item = db.prepare("SELECT id FROM items WHERE id = ?").get(itemId);
  if (!item) {
    return res.status(404).json({ error: `Item ${itemId} not found` });
  }

  const existing = db
    .prepare("SELECT id, vote FROM votes WHERE user_id = ? AND item_id = ?")
    .get(req.user.id, itemId);

  db.prepare(
    `INSERT INTO votes (item_id, vote, user_id) VALUES (?, ?, ?)
     ON CONFLICT(user_id, item_id) DO UPDATE SET
       vote = excluded.vote,
       created_at = datetime('now')`
  ).run(itemId, vote, req.user.id);

  const saved = db
    .prepare("SELECT id, vote FROM votes WHERE user_id = ? AND item_id = ?")
    .get(req.user.id, itemId);

  res.status(existing ? 200 : 201).json({
    ok: true,
    voteId: saved.id,
    itemId,
    vote: saved.vote,
    updated: Boolean(existing),
  });
});

app.listen(PORT, () => {
  const itemCount = db.prepare("SELECT COUNT(*) AS count FROM items").get().count;
  console.log(`API listening on http://localhost:${PORT}`);
  if (itemCount < 100) {
    console.warn(
      `Warning: only ${itemCount} items in DB. Run: npm run seed`
    );
  }
});
