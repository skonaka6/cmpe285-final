const API_BASE = import.meta.env.VITE_API_URL ?? "";
const SESSION_KEY = "swipeVoteSession";

export function getStoredSessionId() {
  return localStorage.getItem(SESSION_KEY);
}

export function setStoredSessionId(sessionId) {
  if (sessionId) localStorage.setItem(SESSION_KEY, sessionId);
  else localStorage.removeItem(SESSION_KEY);
}

async function request(path, options = {}) {
  const sessionId = getStoredSessionId();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(sessionId && { Authorization: `Bearer ${sessionId}` }),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.error ?? `Request failed: ${response.status}`);
    err.status = response.status;
    throw err;
  }

  return data;
}

export function createSession(username) {
  return request("/api/session", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export function getMe() {
  return request("/api/me");
}

export function getItems() {
  return request("/api/items");
}

export function getResults() {
  return request("/api/results");
}

export function postVote(itemId, vote) {
  return request("/api/votes", {
    method: "POST",
    body: JSON.stringify({ itemId, vote }),
  });
}

export function logout() {
  return request("/api/session", { method: "DELETE" }).finally(() => {
    setStoredSessionId(null);
  });
}
