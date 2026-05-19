import { useCallback, useEffect, useState } from "react";
import {
  createSession,
  getItems,
  getMe,
  getResults,
  getStoredSessionId,
  logout,
  postVote,
  setStoredSessionId,
} from "./api/client.js";
import AppHeader from "./components/AppHeader.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import ResultsView from "./components/ResultsView.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [votedIds, setVotedIds] = useState(() => new Set());
  const [voteHistory, setVoteHistory] = useState([]);
  const [reviewOffset, setReviewOffset] = useState(0);
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [swipeTint, setSwipeTint] = useState(null);
  const [swipeTintStrength, setSwipeTintStrength] = useState(0);

  function handleSwipeTint(direction, strength) {
    setSwipeTint(direction);
    setSwipeTintStrength(strength);
  }

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
        setVoteHistory(votes.map((v) => ({ itemId: v.itemId, vote: v.vote })));
        setReviewOffset(0);
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
      const { votes } = await getMe();
      setVotedIds(new Set(votes.map((v) => v.itemId)));
      setVoteHistory(votes.map((v) => ({ itemId: v.itemId, vote: v.vote })));
      setReviewOffset(0);
      await refreshItems();
      setScreen("vote");
    } catch (err) {
      setLoginError(err.message);
    }
  }

  async function handleVote(itemId, vote) {
    await postVote(itemId, vote);
    setVotedIds((prev) => new Set(prev).add(itemId));
    setVoteHistory((prev) => {
      const idx = prev.findIndex((entry) => entry.itemId === itemId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { itemId, vote };
        return next;
      }
      return [...prev, { itemId, vote }];
    });
    // While reviewing past votes, advance forward one step (not back to live deck).
    setReviewOffset((prev) => (prev > 0 ? prev - 1 : 0));
  }

  async function openResults() {
    setScreen("results");
    await refreshResults();
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setUser(null);
      setItems([]);
      setVotedIds(new Set());
      setVoteHistory([]);
      setReviewOffset(0);
      setResults([]);
      setLoginError("");
      setLoggingOut(false);
      setScreen("login");
    }
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
        {user && (
          <AppHeader
            username={user.username}
            onLogout={handleLogout}
            loggingOut={loggingOut}
          />
        )}
        <ResultsView
          results={results}
          loading={resultsLoading}
          onBack={() => setScreen("vote")}
          onRefresh={refreshResults}
        />
      </main>
    );
  }

  return (
    <main
      className="app-shell vote-shell"
      data-swipe-tint={swipeTint ?? ""}
      style={{ "--swipe-tint-opacity": swipeTintStrength }}
    >
      {user && (
        <AppHeader
          username={user.username}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />
      )}
      <SwipeDeck
        items={items}
        votedIds={votedIds}
        voteHistory={voteHistory}
        reviewOffset={reviewOffset}
        onPrevious={() => setReviewOffset((n) => n + 1)}
        onResume={() => setReviewOffset(0)}
        onVote={handleVote}
        onShowResults={openResults}
        onSwipeTint={handleSwipeTint}
      />
    </main>
  );
}
