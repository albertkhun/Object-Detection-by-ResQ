import { useEffect, useRef } from "react";
 
const PHASES = {
  uploading: { label: "UPLOADING IMAGE", desc: "Encoding pixel tensor into quantum register...", step: 0 },
  embedding: { label: "COMPUTING EMBEDDINGS", desc: "Projecting image & text into shared Hilbert space via CLIP...", step: 1 },
  detecting: { label: "QUANTUM MATCHING", desc: "Grounding DINO scanning regions · Probability amplitude matching active...", step: 2 },
  done:      { label: "COMPLETE", desc: "Quantum state collapsed. Results materialized.", step: 3 },
};
 
export default function QuantumViz({ phase, prompts }) {
  const canvasRef = useRef();
 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;
 
    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);
 
      // Draw multiple sine waves (interference pattern)
      const waves = [
        { freq: 1.2, amp: 18, color: "#00ffc8", phase: 0 },
        { freq: 2.1, amp: 10, color: "#7b5ea7", phase: Math.PI / 3 },
        { freq: 0.8, amp: 12, color: "#ff6b6b50", phase: Math.PI / 5 },
      ];
 
      for (const w of waves) {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        for (let x = 0; x <= W; x++) {
          const y = H / 2 + Math.sin((x / W) * Math.PI * 2 * w.freq + t + w.phase) * w.amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
 
      // Superposition (sum of waves) highlighted
      ctx.beginPath();
      ctx.strokeStyle = "#00ffc8";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1;
      for (let x = 0; x <= W; x++) {
        const y = H / 2 + waves.reduce((s, w) => s + Math.sin((x / W) * Math.PI * 2 * w.freq + t + w.phase) * w.amp, 0) / 2;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
 
      // Particles
      for (let i = 0; i < 8; i++) {
        const x = ((t * 40 + i * 80) % W);
        const y = H / 2 + Math.sin(x / W * Math.PI * 4 + t) * 20;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#00ffc8";
        ctx.globalAlpha = 0.8;
        ctx.fill();
      }
 
      ctx.globalAlpha = 1;
      t += 0.03;
      animId = requestAnimationFrame(draw);
    };
 
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
 
  const info = PHASES[phase] || PHASES.uploading;
 
  return (
    <div className="quantum-viz">
      <p className="phase-label">⬡ {info.label}</p>
      <canvas
        ref={canvasRef}
        className="wave-container"
        width={500} height={80}
        style={{ width: "100%", height: 80 }}
      />
      <p className="phase-desc">{info.desc}</p>
 
      {prompts.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {prompts.map((p) => (
            <span key={p} className="prompt-tag" style={{ animation: "border-pulse 1s infinite" }}>
              ⬡ {p}
            </span>
          ))}
        </div>
      )}
 
      <div className="progress-steps">
        {["Upload", "Embed", "Detect", "Done"].map((s, i) => (
          <div
            key={s}
            className={`progress-step ${i < info.step ? "done" : i === info.step ? "active" : ""}`}
            title={s}
          />
        ))}
      </div>
 
      <p style={{ fontSize: 10, color: "var(--text-dim)", textAlign: "center" }}>
        Treating embeddings as quantum states |ψ⟩ · Born's rule probability matching active
      </p>
    </div>
  );
}