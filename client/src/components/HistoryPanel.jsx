import { useEffect, useState } from "react";

export default function HistoryPanel({ apiBase }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${apiBase}/history`).then((r) => r.json()),
      fetch(`${apiBase}/stats`).then((r) => r.json()),
    ])
      .then(([h, s]) => { setHistory(h); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiBase]);

  return (
    <div className="history-page">
      <h2 className="history-title">◈ Detection History</h2>

      {stats && (
        <div className="stats-row" style={{ maxWidth: 600, marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-value">{stats.totalDetections}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(stats.avgProcessingTimeMs)}ms</div>
            <div className="stat-label">Avg Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.topPrompts?.[0]?._id || "—"}</div>
            <div className="stat-label">Top Query</div>
          </div>
        </div>
      )}

      {loading && <p style={{ color: "var(--text-dim)" }}>Loading history...</p>}
      {!loading && history.length === 0 && (
        <p style={{ color: "var(--text-dim)" }}>No detection history yet. Run your first detection!</p>
      )}

      <div className="history-grid">
        {history.map((h) => (
          <div key={h._id} className="history-card">
            <div className="history-card-head">
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                {new Date(h.createdAt).toLocaleString()}
              </span>
              <span className="det-score">{h.detectionCount} found</span>
            </div>
            <div className="history-prompts">
              {(h.prompts || []).map((p) => (
                <span key={p} className="history-tag">{p}</span>
              ))}
            </div>
            <div className="history-meta">
              ⚡ {h.processingTimeMs}ms · {h.device?.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}