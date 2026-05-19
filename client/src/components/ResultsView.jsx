import { useEffect, useMemo, useState } from "react";

const SORTS = [
  { id: "loved", label: "Most loved" },
  { id: "divisive", label: "Most divisive" },
  { id: "skipped", label: "Most skipped" },
];

function sortResults(results, sortId) {
  const rows = results.map((r) => {
    const total = r.yesCount + r.noCount;
    const yesRate = total ? r.yesCount / total : 0;
    const divisiveness = total ? 1 - Math.abs(yesRate - 0.5) * 2 : 0;
    return { ...r, total, yesRate, divisiveness };
  });

  switch (sortId) {
    case "loved":
      return [...rows].sort((a, b) => b.yesRate - a.yesRate || b.total - a.total);
    case "divisive":
      return [...rows].sort((a, b) => b.divisiveness - a.divisiveness || b.total - a.total);
    case "skipped":
      return [...rows].sort((a, b) => a.total - b.total || a.itemId - b.itemId);
    default:
      return rows;
  }
}

export default function ResultsView({ results, loading, onBack, onRefresh }) {
  const [sort, setSort] = useState("loved");

  useEffect(() => {
    const interval = setInterval(onRefresh, 8000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const sorted = useMemo(() => sortResults(results, sort), [results, sort]);

  return (
    <div className="results-view">
      <header className="results-header">
        <button type="button" className="btn-text" onClick={onBack}>
          ← Swipe
        </button>
        <h1>Community results</h1>
        <button type="button" className="btn-text" onClick={onRefresh}>
          Refresh
        </button>
      </header>

      <div className="sort-tabs" role="tablist">
        {SORTS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={sort === s.id}
            className={sort === s.id ? "sort-tab active" : "sort-tab"}
            onClick={() => setSort(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading && <p className="results-loading">Updating…</p>}

      <ul className="results-list">
        {sorted.map((row) => {
          const total = row.yesCount + row.noCount;
          const yesPct = total ? Math.round((row.yesCount / total) * 100) : 0;
          return (
            <li key={row.itemId} className="result-row">
              <img src={row.imageUrl} alt="" className="result-thumb" loading="lazy" />
              <div className="result-meta">
                <h3>{row.title}</h3>
                <div className="result-bar" aria-hidden>
                  <span
                    className="result-bar-yes"
                    style={{ width: `${yesPct}%` }}
                  />
                </div>
                <p className="result-counts">
                  <span className="yes-label">{row.yesCount} adopt</span>
                  <span className="no-label">{row.noCount} pass</span>
                  <span className="muted"> · {total} votes</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
