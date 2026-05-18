# Swipe Vote

Mobile-style swipe voting app (React + Vite frontend, Express + SQLite backend).

## Project layout

```
project/
  client/   # React frontend (API stubs in src/api/client.js)
  server/   # Express API + SQLite
```

## Run the backend (for curl testing)

```bash
cd server
npm install
npm start
```

The API listens on **http://localhost:3000**.

### curl examples

Health check:

```bash
curl http://localhost:3000/api/health
```

List items:

```bash
curl http://localhost:3000/api/items
```

Aggregated results:

```bash
curl http://localhost:3000/api/results
```

Submit a vote:

```bash
curl -X POST http://localhost:3000/api/votes \
  -H "Content-Type: application/json" \
  -d '{"itemId": 1, "vote": "yes"}'
```

Re-check results after voting:

```bash
curl http://localhost:3000/api/results
```

## Run the frontend (optional for now)

Start the backend first, then:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to the backend.

## API summary

| Method | Path           | Body                          | Response              |
|--------|----------------|-------------------------------|-----------------------|
| GET    | `/api/health`  | —                             | `{ ok: true }`        |
| GET    | `/api/items`   | —                             | `{ items: [...] }`    |
| GET    | `/api/results` | —                             | `{ results: [...] }`  |
| POST   | `/api/votes`   | `{ itemId, vote: "yes"\|"no" }` | `{ ok, voteId, ... }` |

SQLite database file: `server/data/votes.db` (created on first run). Three sample items are seeded automatically.
