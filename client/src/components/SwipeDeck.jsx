import { useMemo, useRef, useState } from "react";
import SwipeCard from "./SwipeCard.jsx";

export default function SwipeDeck({
  items,
  votedIds,
  voteHistory,
  reviewOffset,
  onPrevious,
  onResume,
  onVote,
  onShowResults,
  onSwipeTint,
}) {
  const itemsById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items]
  );

  const deck = useMemo(
    () => items.filter((item) => !votedIds.has(item.id)),
    [items, votedIds]
  );

  const [busy, setBusy] = useState(false);
  const touchStartY = useRef(null);

  const isReviewing = reviewOffset > 0;
  const historyEntry = isReviewing
    ? voteHistory[voteHistory.length - reviewOffset]
    : null;

  const current = isReviewing
    ? itemsById.get(historyEntry?.itemId)
    : deck[0];

  const priorVote = isReviewing ? historyEntry?.vote : null;

  const next = useMemo(() => {
    if (isReviewing) {
      if (reviewOffset === 1) return deck[0];
      const peekEntry = voteHistory[voteHistory.length - reviewOffset + 1];
      return peekEntry ? itemsById.get(peekEntry.itemId) : null;
    }
    return deck[1];
  }, [isReviewing, reviewOffset, voteHistory, deck, itemsById]);

  const votedCount = votedIds.size;
  const total = items.length;
  const canGoPrevious =
    voteHistory.length > 0 && reviewOffset < voteHistory.length;

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
    if (delta > 80 && !isReviewing) onShowResults();
  }

  if (!current && !isReviewing) {
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

  if (!current && isReviewing) {
    return (
      <section className="deck-empty">
        <p className="form-error">Could not load this item.</p>
        <button type="button" className="btn-text" onClick={onResume}>
          Back to current
        </button>
      </section>
    );
  }

  return (
    <section className="swipe-deck">
      <header className="deck-header">
        <p className="deck-progress">
          {isReviewing
            ? `Reviewing · ${reviewOffset} back`
            : `${votedCount + 1} / ${total}`}
        </p>
        <button type="button" className="btn-text" onClick={onShowResults}>
          Results ↓
        </button>
      </header>

      {isReviewing && (
        <p className="review-banner">
          Past vote — swipe to change it, then you&apos;ll move to the next card.{" "}
          <button type="button" className="btn-text-inline" onClick={onResume}>
            Resume where you left off -&gt;
          </button>
        </p>
      )}

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
          key={`${current.id}-${reviewOffset}-${priorVote}`}
          item={current}
          priorVote={priorVote}
          onVote={handleVote}
          onSwipeTint={onSwipeTint}
          disabled={busy}
        />
      </section>

      <footer className="vote-actions">
        <button
          type="button"
          className="btn-previous"
          disabled={!canGoPrevious || busy}
          onClick={onPrevious}
          aria-label="Previous voted card"
        >
          ← Previous
        </button>
        <div className="vote-buttons-row">
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
        </div>
      </footer>
    </section>
  );
}
