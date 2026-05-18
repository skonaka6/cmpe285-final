const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error ?? `Request failed: ${response.status}`);
  }

  return data;
}

/** GET /api/items — list items to vote on */
export function getItems() {
  return request("/api/items");
}

/** GET /api/results — aggregated yes/no counts per item */
export function getResults() {
  return request("/api/results");
}

/** POST /api/votes — submit a yes/no vote for an item */
export function postVote(itemId, vote) {
  return request("/api/votes", {
    method: "POST",
    body: JSON.stringify({ itemId, vote }),
  });
}
