# Swipe Vote — Style Check

Mobile-first web app where you swipe through **clothing looks** and vote **yes** (approve) or **no** (pass). Community results show aggregate yes/no counts across all users.

**Theme:** Would you wear or buy this item? Each card shows a product photo, name, and style details from the Myntra-style dataset in `server/data/`.

## Project layout

```
project/
  client/          # React + Vite frontend
  server/          # Express + SQLite API
  server/seed.js   # Seeds 100 items from styles.csv + images.csv
  server/data/     # styles.csv, images.csv
```

## Quick start

### 1. Backend

```bash
cd server
npm install
npm run seed        # first time, or npm run seed:force to reset
npm start
```

API: **http://localhost:3000**

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** (Vite proxies `/api` to the backend).

## Architecture

![Swipe Vote architecture](documentation/architecture.png)

The **Express** server owns all vote data in **SQLite** (`server/data/votes.db`). Users sign in with a **username** (no password); the server returns a **session UUID** stored in `localStorage` and sent as `Authorization: Bearer <token>`. Votes are keyed by `(user_id, item_id)` with a unique constraint and SQLite `ON CONFLICT` upsert so repeat votes update rather than double-count.

The **React** client loads the deck of items the user has not voted on yet, supports pointer swipe and yes/no buttons, and offers a results screen with sort tabs (most loved, most divisive, most skipped). Results poll every 8 seconds while open.

**Why SQLite:** Zero-config, single file, fine for local demo and class scale; `better-sqlite3` gives synchronous queries without an ORM.

**Dedup:** One vote per user per item. `UNIQUE(user_id, item_id)` on `votes`; `POST /api/votes` upserts on conflict.

**Images:** Loaded from `images.csv` (Myntra asset URLs linked by style id). Requires network access to load photos in the browser.

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/api/session` | — | `{ username }` → `{ sessionId, user }` |
| GET | `/api/me` | Bearer | Current user + their votes |
| DELETE | `/api/session` | Bearer | Log out |
| GET | `/api/items` | optional | All items + `votedItemIds` if signed in |
| GET | `/api/results` | — | Aggregate yes/no per item |
| POST | `/api/votes` | Bearer | `{ itemId, vote: "yes"\|"no" }` |

### curl examples

```bash
# Create session
curl -s -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"username":"demo"}' | jq

# Vote (use sessionId from above)
curl -s -X POST http://localhost:3000/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_ID" \
  -d '{"itemId":1,"vote":"yes"}'

curl -s http://localhost:3000/api/results | jq '.results[0:3]'
```

## Requirements checklist

### Core (3.1)

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Voting theme documented | ✅ Clothing / style approval |
| 2 | 100+ items with image + label | ✅ 100 from CSV (`npm run seed`) |
| 3 | Swipe UI yes/no + buttons + feedback + next card | ✅ |
| 4 | Results view + sort/filter | ✅ 3 sort modes |
| 5 | Server persistence | ✅ SQLite |
| 6 | End-of-deck state | ✅ |

### Stretch (3.2)

| # | Feature | Status |
|---|---------|--------|
| 7 | User identity (username session) | ✅ |
| 8 | Undo last swipe | ❌ |
| 9 | Matches view | ❌ |
| 10 | Real-time results | ✅ 8s polling on results screen |
| 11 | Admin seed script | ✅ `npm run seed` |
| 12 | Analytics | ❌ |

## Known issues

- Placeholder images require network access to picsum.photos.
- Swipe-down to open results is a light touch gesture on the card stack; the **Results ↓** button is the reliable control.
- Re-seeding with `--force` clears all votes.

See **AI_NOTES.md** for the AI collaboration write-up template.
