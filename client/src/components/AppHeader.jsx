export default function AppHeader({ username, onLogout, loggingOut }) {
  return (
    <header className="app-header">
      <span className="app-header-user">@{username}</span>
      <button
        type="button"
        className="btn-logout"
        onClick={onLogout}
        disabled={loggingOut}
      >
        {loggingOut ? "Logging out…" : "Log out"}
      </button>
    </header>
  );
}
