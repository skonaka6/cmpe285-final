import { useMemo, useRef, useState } from "react";
import SwipeCard from "./SwipeCard.jsx";

export default function SwipeDeck({
  items,
  votedIds,
  onVote,
  onShowResults,
  onSwipeTint,
}) {
  const deck = useMemo(
    () => items.filter((item) => !votedIds.has(item.id)),
    [items, votedIds]
  );

  const [busy, setBusy] = useState(false);
  const touchStartY = useRef(null);
  const current = deck[0];
  const next = deck[1];
  const votedCount = votedIds.size;
  const total = items.length;

  async function handleVote(choice) {
    if (!current || busy) return;
    setBusy(true);
    try {
      await onVote(current.id, choice);
    } finally {
      setBusy(false);
    }
  }

  function onTouchStart(e) {
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e) {
    if (touchStartY.current == null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (delta > 80) onShowResults();
  }

  if (!current) {
    return (
      <section className="deck-empty">
        <p className="eyebrow">All done</p>
        <h2>You&apos;ve rated every look!</h2>
        <p>See how everyone else voted on the community results.</p>
        <button type="button" className="btn-primary" onClick={onShowResults}>
          View results
        </button>
      </section>
    );
  }

  return (
    <section className="swipe-deck">
      <header className="deck-header">
        <p className="deck-progress">
          {votedCount + 1} / {total}
        </p>
        <button type="button" className="btn-text" onClick={onShowResults}>
          Results ↓
        </button>
      </header>

      <section
        className="card-stack"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {next && (
          <article className="swipe-card swipe-card-back" aria-hidden>
            <figure className="swipe-card-image-wrap">
              <img src={next.imageUrl} alt="" draggable={false} />
            </figure>
          </article>
        )}
        <SwipeCard
          key={current.id}
          item={current}
          onVote={handleVote}
          onSwipeTint={onSwipeTint}
          disabled={busy}
        />
      </section>

      <footer className="vote-actions">
        <button
          type="button"
          className="vote-btn vote-no"
          disabled={busy}
          onClick={() => handleVote("no")}
          aria-label="Pass"
        >
          ✕
        </button>
        <button
          type="button"
          className="vote-btn vote-yes"
          disabled={busy}
          onClick={() => handleVote("yes")}
          aria-label="Approve"
        >
          ♥
        </button>
      </footer>
    </section>
  );
}
