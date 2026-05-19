import db from "./db.js";

export function requireSession(req, res, next) {
  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, "") ??
    req.headers["x-session-id"];

  if (!token) {
    return res.status(401).json({ error: "Sign in required" });
  }

  const row = db
    .prepare(
      `SELECT s.id AS sessionId, u.id, u.username
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND datetime(s.expires_at) > datetime('now')`
    )
    .get(token);

  if (!row) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  req.user = { id: row.id, username: row.username };
  req.sessionId = row.sessionId;
  next();
}

export function optionalSession(req, _res, next) {
  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, "") ??
    req.headers["x-session-id"];

  if (token) {
    const row = db
      .prepare(
        `SELECT s.id AS sessionId, u.id, u.username
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.id = ? AND datetime(s.expires_at) > datetime('now')`
      )
      .get(token);

    if (row) {
      req.user = { id: row.id, username: row.username };
      req.sessionId = row.sessionId;
    }
  }

  next();
}
