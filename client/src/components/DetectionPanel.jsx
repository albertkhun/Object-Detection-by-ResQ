import { useState } from "react";
 
export default function DetectionPanel({
  prompts, setPrompts, threshold, setThreshold,
  onDetect, loading, hasImage,
}) {
  const [input, setInput] = useState("");
 
  const addPrompt = () => {
    const val = input.trim().toLowerCase();
    if (val && !prompts.includes(val)) {
      setPrompts([...prompts, val]);
      setInput("");
    }
  };
 
  const removePrompt = (p) => setPrompts(prompts.filter((x) => x !== p));
 
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addPrompt(); }
  };
 
  return (
    <div className="card">
      <div className="card-title">Detection Targets</div>
 
      <div className="prompts-list">
        {prompts.map((p) => (
          <div key={p} className="prompt-tag">
            {p}
            <button onClick={() => removePrompt(p)}>×</button>
          </div>
        ))}
      </div>
 
      <div className="add-prompt-row">
        <input
          className="add-prompt-input"
          placeholder="Type object (e.g. helmet)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="add-btn" onClick={addPrompt}>+</button>
      </div>
 
      <div className="slider-row">
        <div className="slider-label">
          <span style={{ color: "var(--text-dim)" }}>Detection Threshold</span>
          <span>{threshold.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0.1" max="0.9" step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
        />
      </div>
 
      <button
        className={`detect-btn ${loading ? "loading" : ""}`}
        onClick={onDetect}
        disabled={loading || !hasImage || prompts.length === 0}
      >
        {loading ? "⬡ Processing Quantum States..." : "⚡ Run Detection"}
      </button>
    </div>
  );
}
 