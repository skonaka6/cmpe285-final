import cors from "cors";
import express from "express";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/items", (_req, res) => {
  const items = db
    .prepare("SELECT id, title, description FROM items ORDER BY id")
    .all();
  res.json({ items });
});

app.get("/api/results", (_req, res) => {
  const results = db
    .prepare(
      `SELECT
         i.id AS itemId,
         i.title,
         COALESCE(SUM(CASE WHEN v.vote = 'yes' THEN 1 ELSE 0 END), 0) AS yesCount,
         COALESCE(SUM(CASE WHEN v.vote = 'no' THEN 1 ELSE 0 END), 0) AS noCount
       FROM items i
       LEFT JOIN votes v ON v.item_id = i.id
       GROUP BY i.id, i.title
       ORDER BY i.id`
    )
    .all();
  res.json({ results });
});

app.post("/api/votes", (req, res) => {
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

  const result = db
    .prepare("INSERT INTO votes (item_id, vote) VALUES (?, ?)")
    .run(itemId, vote);

  res.status(201).json({
    ok: true,
    voteId: result.lastInsertRowid,
    itemId,
    vote,
  });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
