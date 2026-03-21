import { useState, useRef, useCallback } from "react";
import UploadZone from "./components/UploadZone";
import DetectionPanel from "./components/DetectionPanel";
import QuantumViz from "./components/QuantumViz";
import ResultView from "./components/ResultView";
import HistoryPanel from "./components/HistoryPanel";
import "./App.css";
 
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
 
export default function App() {
  const [image, setImage] = useState(null);          // File object
  const [imagePreview, setImagePreview] = useState(null); // data URL
  const [prompts, setPrompts] = useState(["helmet"]);
  const [threshold, setThreshold] = useState(0.3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | uploading | embedding | detecting | done
  const [activeTab, setActiveTab] = useState("detect"); // detect | history
 
  const handleImageSelect = useCallback((file) => {
    setImage(file);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);
 
  const handleDetect = async () => {
    if (!image) return setError("Please upload an image first.");
    if (prompts.filter(Boolean).length === 0) return setError("Add at least one detection prompt.");
 
    setLoading(true);
    setError(null);
    setResult(null);
 
    const phases = ["uploading", "embedding", "detecting"];
    for (const p of phases) {
      setPhase(p);
      await new Promise((r) => setTimeout(r, 600));
    }
 
    try {
      const form = new FormData();
      form.append("image", image);
      form.append("prompts", prompts.filter(Boolean).join(","));
      form.append("threshold", threshold);
 
      const res = await fetch(`${API_BASE}/detect`, {
        method: "POST",
        body: form,
      });
 
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Detection failed");
      }
 
      const data = await res.json();
      setResult(data);
      setPhase("done");
    } catch (e) {
      setError(e.message);
      setPhase("idle");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="app">
      {/* Animated background grid */}
      <div className="bg-grid" />
      <div className="bg-glow" />
 
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <span className="logo-icon">⬡</span>
          <div>
            <h1 className="logo-title">QUANTUM<span className="accent">DINO</span></h1>
            <p className="logo-sub">Zero-Shot Object Detection · Quantum-Inspired AI</p>
          </div>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${activeTab === "detect" ? "active" : ""}`}
            onClick={() => setActiveTab("detect")}
          >
            ⬡ Detect
          </button>
          <button
            className={`nav-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            ◈ History
          </button>
        </nav>
      </header>
 
      {activeTab === "history" ? (
        <HistoryPanel apiBase={API_BASE} />
      ) : (
        <main className="main">
          {/* Left Column */}
          <section className="col-left">
            <UploadZone onImageSelect={handleImageSelect} imagePreview={imagePreview} />
            <DetectionPanel
              prompts={prompts}
              setPrompts={setPrompts}
              threshold={threshold}
              setThreshold={setThreshold}
              onDetect={handleDetect}
              loading={loading}
              hasImage={!!image}
            />
          </section>
 
          {/* Right Column */}
          <section className="col-right">
            {loading && <QuantumViz phase={phase} prompts={prompts} />}
            {error && (
              <div className="error-card">
                <span className="error-icon">⚠</span>
                <p>{error}</p>
              </div>
            )}
            {result && !loading && <ResultView result={result} />}
            {!result && !loading && !error && (
              <div className="placeholder">
                <div className="placeholder-icon">⬡</div>
                <h2>Upload an image & describe what to find</h2>
                <p>Grounding DINO + CLIP + Quantum-Inspired matching will locate it instantly</p>
                <div className="placeholder-examples">
                  {["helmet", "pothole", "fire hydrant", "person", "car", "dog"].map((ex) => (
                    <button
                      key={ex}
                      className="example-chip"
                      onClick={() => setPrompts((p) => [...new Set([...p, ex])])}
                    >
                      + {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      )}
 
      {/* Footer */}
      <footer className="footer">
        <span>⬡ Grounding DINO · CLIP · Quantum-Inspired Matching · MERN Stack</span>
        <span>Zero-Shot · No Training Required · Any Object · Any Language</span>
      </footer>
    </div>
  );
}
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);