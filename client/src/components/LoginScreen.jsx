import { useState } from "react";

export default function LoginScreen({ onLogin, error }) {
  const [username, setUsername] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onLogin(username.trim());
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <p className="eyebrow">Swipe Vote</p>
        <h1>Style Check</h1>
        <p className="login-sub">
          Swipe right to approve a look, left to pass. Pick a username to save
          your votes across sessions.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="e.g. fashionista42"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={24}
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={!username.trim()}>
            Start swiping
          </button>
        </form>
      </div>
    </div>
  );
}
