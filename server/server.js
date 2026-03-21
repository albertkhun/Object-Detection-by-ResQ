const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const mongoose = require("mongoose");
require("dotenv").config();
 
const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_API = process.env.PYTHON_API_URL || "http://localhost:8000";
 
// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
 
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});
 
// ── MongoDB ───────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quantumdino";
 
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.warn("⚠️  MongoDB not connected:", err.message));
 
// Detection Session Schema
const detectionSchema = new mongoose.Schema({
  prompts: [String],
  detectionCount: Number,
  quantumScores: mongoose.Schema.Types.Mixed,
  processingTimeMs: Number,
  imageSize: mongoose.Schema.Types.Mixed,
  device: String,
  createdAt: { type: Date, default: Date.now },
});
 
const Detection = mongoose.model("Detection", detectionSchema);

const objectSchema = new mongoose.Schema({
  label: String,
  embedding: [Number],
  createdAt: { type: Date, default: Date.now },
});

const ObjectModel = mongoose.model("Object", objectSchema);
 
// ── Routes ────────────────────────────────────────────────
 
// Health check
app.get("/api/health", async (req, res) => {
  try {
    const pyHealth = await axios.get(`${PYTHON_API}/health`, { timeout: 5000 });
    res.json({
      node: "online",
      python: pyHealth.data,
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  } catch {
    res.json({ node: "online", python: "offline", mongodb: "unknown" });
  }
});
 
// Main detect endpoint — proxies to Python + logs to MongoDB
app.post("/api/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }
 
    const { prompts, threshold = "0.3" } = req.body;
    if (!prompts) {
      return res.status(400).json({ error: "prompts field is required." });
    }
 
    // Forward to Python API
    const form = new FormData();
    form.append("image", req.file.buffer, {
      filename: req.file.originalname || "image.jpg",
      contentType: req.file.mimetype,
    });
    form.append("prompts", prompts);
    form.append("threshold", threshold);
 
    const pyRes = await axios.post(`${PYTHON_API}/detect`, form, {
      headers: form.getHeaders(),
      timeout: 120000, // 2 min (model loading can be slow first time)
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
 
    const data = pyRes.data;
 
    // Log to MongoDB (non-blocking)
    Detection.create({
      prompts: data.prompts,
      detectionCount: data.detections?.length || 0,
      quantumScores: data.quantum_scores,
      processingTimeMs: data.processing_time_ms,
      imageSize: data.image_size,
      device: data.device,
    }).catch((e) => console.warn("MongoDB log failed:", e.message));
 
    res.json(data);
  } catch (err) {
    const msg = err.response?.data || err.message;
    console.error("Detection error:", msg);
    res.status(500).json({ error: "Detection failed", detail: msg });
  }
});

app.post("/api/add-object", async (req, res) => {
  try {
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: "Label required" });

    const exists = await ObjectModel.findOne({ label });
    if (exists) return res.json({ message: "Already exists" });

    await ObjectModel.create({ label });

    res.json({ success: true, label });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/objects", async (req, res) => {
  const objects = await ObjectModel.find().select("label -_id");
  res.json(objects.map(o => o.label));
});
 
// History endpoint — last 20 detections
app.get("/api/history", async (req, res) => {
  try {
    const history = await Detection.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-__v");
    res.json(history);
  } catch (err) {
    res.json([]);
  }
});
 
// Stats endpoint
app.get("/api/stats", async (req, res) => {
  try {
    const total = await Detection.countDocuments();
    const avgTime = await Detection.aggregate([
      { $group: { _id: null, avg: { $avg: "$processingTimeMs" } } },
    ]);
    const topPrompts = await Detection.aggregate([
      { $unwind: "$prompts" },
      { $group: { _id: "$prompts", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    res.json({
      totalDetections: total,
      avgProcessingTimeMs: avgTime[0]?.avg || 0,
      topPrompts,
    });
  } catch {
    res.json({ totalDetections: 0, avgProcessingTimeMs: 0, topPrompts: [] });
  }
});
 
app.listen(PORT, () => {
  console.log(`🚀 Node server running on http://localhost:${PORT}`);
  console.log(`🔗 Python API at ${PYTHON_API}`);
});