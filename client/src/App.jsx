import { useCallback, useEffect, useState } from "react";
import {
  createSession,
  getItems,
  getMe,
  getResults,
  getStoredSessionId,
  postVote,
  setStoredSessionId,
} from "./api/client.js";
import LoginScreen from "./components/LoginScreen.jsx";
import ResultsView from "./components/ResultsView.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [votedIds, setVotedIds] = useState(() => new Set());
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const refreshItems = useCallback(async () => {
    const { items: list, votedItemIds } = await getItems();
    setItems(list);
    setVotedIds(new Set(votedItemIds));
  }, []);

  const refreshResults = useCallback(async () => {
    setResultsLoading(true);
    try {
      const { results: rows } = await getResults();
      setResults(rows);
    } finally {
      setResultsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function bootstrap() {
      const sessionId = getStoredSessionId();
      if (!sessionId) {
        setScreen("login");
        return;
      }

      try {
        const { user: me, votes } = await getMe();
        setUser(me);
        setVotedIds(new Set(votes.map((v) => v.itemId)));
        await refreshItems();
        setScreen("vote");
      } catch {
        setStoredSessionId(null);
        setScreen("login");
      }
    }

    bootstrap();
  }, [refreshItems]);

  async function handleLogin(username) {
    setLoginError("");
    try {
      const { sessionId, user: u } = await createSession(username);
      setStoredSessionId(sessionId);
      setUser(u);
      await refreshItems();
      setScreen("vote");
    } catch (err) {
      setLoginError(err.message);
    }
  }

  async function handleVote(itemId, vote) {
    await postVote(itemId, vote);
    setVotedIds((prev) => new Set(prev).add(itemId));
  }

  async function openResults() {
    setScreen("results");
    await refreshResults();
  }

  if (screen === "loading") {
    return (
      <main className="app-shell">
        <p className="center-msg">Loading…</p>
      </main>
    );
  }

  if (screen === "login") {
    return (
      <main className="app-shell">
        <LoginScreen onLogin={handleLogin} error={loginError} />
      </main>
    );
  }

  if (screen === "results") {
    return (
      <main className="app-shell results-shell">
        <ResultsView
          results={results}
          loading={resultsLoading}
          onBack={() => setScreen("vote")}
          onRefresh={refreshResults}
        />
        {user && (
          <p className="user-badge">Signed in as {user.username}</p>
        )}
      </main>
    );
  }

  return (
    <main className="app-shell vote-shell">
      <SwipeDeck
        items={items}
        votedIds={votedIds}
        onVote={handleVote}
        onShowResults={openResults}
      />
      {user && (
        <p className="user-badge">@{user.username}</p>
      )}
    </main>
  );
}
