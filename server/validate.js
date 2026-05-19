const USERNAME_RE = /^[a-zA-Z0-9_]{2,24}$/;

export function normalizeUsername(raw) {
  if (typeof raw !== "string") return null;
  const username = raw.trim();
  if (!USERNAME_RE.test(username)) return null;
  return username;
}
