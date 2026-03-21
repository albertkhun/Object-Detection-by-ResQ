export default function ResultView({ result }) {
  const {
    result_image, detections = [], quantum_scores = [],
    processing_time_ms, model_info, prompts = [], device,
  } = result;

  return (
    <div className="result-view">
      {/* Result image */}
      <div className="result-image-wrap">
        <img
          src={`data:image/jpeg;base64,${result_image}`}
          alt="Detection result"
        />
        <div className="result-badge">
          ⬡ {detections.length} object{detections.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{detections.length}</div>
          <div className="stat-label">Objects Found</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{processing_time_ms}ms</div>
          <div className="stat-label">Processing Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{device?.toUpperCase() || "CPU"}</div>
          <div className="stat-label">Device</div>
        </div>
      </div>

      {/* Detection list */}
      {detections.length > 0 && (
        <div className="card">
          <div className="card-title">Detected Objects</div>
          <div className="detections-list">
            {detections.map((d, i) => (
              <div key={i} className="detection-item">
                <div>
                  <div className="det-label">{d.label}</div>
                  <div className="det-box">
                    [{d.box.map((v) => Math.round(v)).join(", ")}]
                  </div>
                </div>
                <div className="det-score">{(d.score * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {detections.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "24px" }}>
          <p style={{ color: "var(--text-dim)" }}>
            No objects detected above threshold. Try lowering the threshold or rephrasing your prompt.
          </p>
        </div>
      )}

      {/* Quantum scores */}
      {quantum_scores.length > 0 && (
        <div className="card">
          <div className="card-title">Quantum Similarity Analysis</div>
          <div className="quantum-scores-grid">
            {quantum_scores.map((q) => (
              <div key={q.label} className="q-score-card">
                <div className="q-score-label">{q.label}</div>
                {[
                  ["Amplitude ⟨φ|ψ⟩", q.raw_amplitude],
                  ["Probability |amp|²", q.probability_amplitude],
                  ["Interference", q.interference_weight],
                  ["Entanglement Score", q.entanglement_score],
                  ["Confidence", q.confidence],
                ].map(([name, val]) => (
                  <div key={name} className="q-metric">
                    <span className="q-metric-name">{name}</span>
                    <span className="q-metric-val">{(val * 100).toFixed(1)}%</span>
                  </div>
                ))}
                <div className="bar-wrap">
                  <div className="bar-fill" style={{ width: `${(q.confidence * 100).toFixed(1)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model info */}
      <div className="card" style={{ fontSize: 11, color: "var(--text-dim)" }}>
        <div className="card-title">Model Stack</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div>⬡ <strong style={{ color: "var(--text)" }}>Detector:</strong> {model_info?.detector}</div>
          <div>⬡ <strong style={{ color: "var(--text)" }}>Encoder:</strong> {model_info?.encoder}</div>
          <div>⬡ <strong style={{ color: "var(--text)" }}>Matching:</strong> {model_info?.similarity}</div>
        </div>
      </div>
    </div>
  );
}