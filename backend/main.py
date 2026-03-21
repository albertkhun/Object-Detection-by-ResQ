from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import cv2
import os
import sys
import time
from typing import List
import warnings
warnings.filterwarnings("ignore")
 
app = FastAPI(title="Quantum-Inspired Zero-Shot Object Detection API", version="1.0.0")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
# ─────────────────────────────────────────
# Model loading (lazy, on first request)
# ─────────────────────────────────────────
clip_model = None
clip_processor = None
gdino_model = None
gdino_processor = None
device = "cuda" if torch.cuda.is_available() else "cpu"
 
 
def load_clip():
    global clip_model, clip_processor
    if clip_model is None:
        from transformers import CLIPModel, CLIPProcessor
        print("Loading CLIP model...")
        clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
        clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        clip_model.eval()
    return clip_model, clip_processor
 
 
def load_grounding_dino():
    global gdino_model, gdino_processor
    if gdino_model is None:
        try:
            from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection
            print("Loading Grounding DINO model...")
            model_id = "IDEA-Research/grounding-dino-tiny"
            gdino_processor = AutoProcessor.from_pretrained(model_id)
            gdino_model = AutoModelForZeroShotObjectDetection.from_pretrained(model_id).to(device)
            gdino_model.eval()
        except Exception as e:
            print(f"Grounding DINO load error: {e}")
            gdino_model = None
            gdino_processor = None
    return gdino_model, gdino_processor
 
 
# ─────────────────────────────────────────
# Quantum-Inspired Similarity Engine
# ─────────────────────────────────────────
 
def quantum_inspired_similarity(image_embeddings: np.ndarray, text_embeddings: np.ndarray) -> dict:
    """
    Quantum-Inspired Probability Amplitude Matching.
 
    We treat each embedding vector as a quantum state |ψ⟩ in a high-dimensional
    Hilbert space. Similarity is computed via:
 
      P(match) = |⟨φ_text | ψ_image⟩|²
 
    This is analogous to measuring the probability amplitude between two quantum
    states using Born's rule, extended with an attention-style softmax gate
    (quantum interference simulation).
    """
    # Normalize embeddings → unit quantum states
    img_norm = image_embeddings / (np.linalg.norm(image_embeddings, axis=-1, keepdims=True) + 1e-8)
    txt_norm = text_embeddings / (np.linalg.norm(text_embeddings, axis=-1, keepdims=True) + 1e-8)
 
    # Inner product: ⟨φ|ψ⟩ (amplitude)
    raw_amplitude = np.dot(img_norm, txt_norm.T)
 
    # Born's rule: probability = |amplitude|²
    probability = raw_amplitude ** 2
 
    # Quantum interference gate (softmax as quantum measurement collapse)
    temperature = 0.07  # CLIP temperature
    logits = raw_amplitude / temperature
    interference_weights = np.exp(logits) / (np.sum(np.exp(logits)) + 1e-8)
 
    # Entanglement score: combined metric
    entanglement_score = float(0.6 * probability.mean() + 0.4 * interference_weights.mean())
 
    return {
        "raw_amplitude": float(raw_amplitude.mean()),
        "probability_amplitude": float(probability.mean()),
        "interference_weight": float(interference_weights.mean()),
        "entanglement_score": entanglement_score,
        "confidence": float(np.clip(entanglement_score * 2.5, 0, 1)),
    }
 
 
# ─────────────────────────────────────────
# Detection Pipeline
# ─────────────────────────────────────────
 
def run_grounding_dino(pil_image: Image.Image, text_prompts: List[str], threshold: float = 0.3):
    """Run Grounding DINO zero-shot detection."""
    model, processor = load_grounding_dino()
    if model is None:
        return []
 
    # Format prompt: "helmet. pothole." (DINO expects dot-separated)
    text_query = ". ".join(text_prompts) + "."
 
    inputs = processor(images=pil_image, text=text_query, return_tensors="pt").to(device)
 
    with torch.no_grad():
        outputs = model(**inputs)
 
    results = processor.post_process_grounded_object_detection(
        outputs,
        inputs.input_ids,
        box_threshold=threshold,
        text_threshold=threshold * 0.8,
        target_sizes=[pil_image.size[::-1]],
    )[0]
 
    detections = []
    for box, score, label in zip(results["boxes"], results["scores"], results["labels"]):
        detections.append({
            "box": box.tolist(),       # [x1, y1, x2, y2]
            "score": float(score),
            "label": label,
        })
    return detections
 
 
def run_clip_embeddings(pil_image: Image.Image, text_prompts: List[str]):
    """Compute CLIP embeddings and quantum similarity."""
    model, processor = load_clip()
 
    inputs = processor(
        text=text_prompts,
        images=pil_image,
        return_tensors="pt",
        padding=True,
    ).to(device)
 
    with torch.no_grad():
        outputs = model(**inputs)
        image_emb = outputs.image_embeds.cpu().numpy()
        text_emb = outputs.text_embeds.cpu().numpy()
 
    quantum_scores = []
    for i, prompt in enumerate(text_prompts):
        q = quantum_inspired_similarity(image_emb, text_emb[i:i+1])
        q["label"] = prompt
        quantum_scores.append(q)
 
    return quantum_scores
 
 
def draw_boxes(pil_image: Image.Image, detections: list, quantum_scores: dict) -> Image.Image:
    """Draw bounding boxes with quantum-score labels."""
    img = pil_image.copy().convert("RGB")
    draw = ImageDraw.Draw(img)
 
    colors = ["#00FFCC", "#FF6B6B", "#FFE66D", "#A8FF78", "#FF78A8", "#78A8FF"]
 
    for idx, det in enumerate(detections):
        x1, y1, x2, y2 = det["box"]
        label = det["label"]
        score = det["score"]
        color = colors[idx % len(colors)]
 
        # Box
        draw.rectangle([x1, y1, x2, y2], outline=color, width=3)
 
        # Label background
        label_text = f"{label} {score:.2f}"
        bbox_text = draw.textbbox((x1, y1 - 20), label_text)
        draw.rectangle([bbox_text[0]-2, bbox_text[1]-2, bbox_text[2]+2, bbox_text[3]+2], fill=color)
        draw.text((x1, y1 - 20), label_text, fill="black")
 
    return img
 
 
def image_to_base64(pil_image: Image.Image) -> str:
    buffer = io.BytesIO()
    pil_image.save(buffer, format="JPEG", quality=90)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
 
 
# ─────────────────────────────────────────
# API Routes
# ─────────────────────────────────────────
 
@app.get("/")
def root():
    return {"message": "Quantum-Inspired Zero-Shot Object Detection API", "status": "online"}
 
 
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "device": device,
        "cuda_available": torch.cuda.is_available(),
    }
 
 
@app.post("/detect")
async def detect(
    image: UploadFile = File(...),
    prompts: str = Form(...),           # comma-separated, e.g. "helmet,pothole"
    threshold: float = Form(0.3),
):
    start_time = time.time()
 
    # Parse prompts
    text_prompts = [p.strip() for p in prompts.split(",") if p.strip()]
    if not text_prompts:
        raise HTTPException(status_code=400, detail="At least one detection prompt is required.")
 
    # Load image
    contents = await image.read()
    try:
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file.")
 
    # Resize large images for speed
    max_dim = 1024
    w, h = pil_image.size
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        pil_image = pil_image.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
 
    # Run Grounding DINO
    try:
        detections = run_grounding_dino(pil_image, text_prompts, threshold)
    except Exception as e:
        detections = []
        print(f"DINO error: {e}")
 
    # Run CLIP quantum similarity
    try:
        quantum_scores = run_clip_embeddings(pil_image, text_prompts)
    except Exception as e:
        quantum_scores = []
        print(f"CLIP error: {e}")
 
    # Draw result
    result_image = draw_boxes(pil_image, detections, quantum_scores)
    result_b64 = image_to_base64(result_image)
    original_b64 = image_to_base64(pil_image)
 
    elapsed = time.time() - start_time
 
    return JSONResponse({
        "success": True,
        "processing_time_ms": round(elapsed * 1000),
        "image_size": {"width": pil_image.width, "height": pil_image.height},
        "prompts": text_prompts,
        "detections": detections,
        "quantum_scores": quantum_scores,
        "result_image": result_b64,
        "original_image": original_b64,
        "device": device,
        "model_info": {
            "detector": "Grounding DINO (IDEA-Research/grounding-dino-tiny)",
            "encoder": "CLIP (openai/clip-vit-base-patch32)",
            "similarity": "Quantum-Inspired Probability Amplitude Matching",
        },
    })
 
 
@app.post("/embed")
async def embed_only(
    image: UploadFile = File(...),
    prompts: str = Form(...),
):
    """Return only CLIP quantum similarity (no detection boxes)."""
    contents = await image.read()
    pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    text_prompts = [p.strip() for p in prompts.split(",") if p.strip()]
    quantum_scores = run_clip_embeddings(pil_image, text_prompts)
    return JSONResponse({"quantum_scores": quantum_scores})
 
 
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
 