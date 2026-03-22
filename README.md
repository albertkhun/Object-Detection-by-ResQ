# Hackathon Technical Disclosure & Compliance Document

## Team Information
- **Team Name**: ResQ
- **Project Title**: Quantum-Enhanced Real-Time Object Detection
with Incremental Learning.​
- **Problem Statement / Track**: Design and develop an object detection system that can dynamically recognize new objects without requiring complete retraining of the model.

The system should initially detect a predefined set of objects (e.g., x, y, z) after training. However, it must also support the addition of new object classes (e.g., ‘a’) on demand, without undergoing full retraining, fine-tuning, or transfer learning.

The goal is to create a flexible and scalable detection model capable of adapting to new object categories efficiently in real time.
- **Team Members**: Khundongbam Albert Singh,Jack Sinamcha, Tunisia Yumnam, Tourangbam Ningthouba
- **Repository Link (if public)**: https://github.com/albertkhun/Object-Detection-by-ResQ
- **Deployment Link (if applicable)**: will be updated later

---

## 1. APIs & External Services Used

### API / Service Entry
- **API / Service Name**: Grounding DINO Model
- **Provider / Organization**: IDEA Research (via Hugging Face)
- **Purpose in Project**: Zero-shot object detection (bounding boxes)
- **API Type**:
  - [ ] REST
  - [ ] GraphQL
  - [✔] SDK
  - [ ] Other (specify)
- **License Type**:
  - [✔] Open Source
  - [ ] Free Tier
  - [ ] Academic
  - [ ] Commercial
- **License Link / Documentation URL**: https://huggingface.co/IDEA-Research/grounding-dino-tiny
- **Rate Limits (if any)**: None (local inference)
- **Commercial Use Allowed**:
  - [✔] Yes
  - [ ] No
  - [ ] Unclear

---

### API / Service Entry
- **API / Service Name**: CLIP Model
- **Provider / Organization**: OpenAI (via Hugging Face Transformers)
- **Purpose in Project**: Image-text embedding and similarity computation
- **API Type**:
  - [ ] REST
  - [ ] GraphQL
  - [✔] SDK
  - [ ] Other (specify)
- **License Type**:
  - [✔] Open Source
  - [ ] Free Tier
  - [ ] Academic
  - [ ] Commercial
- **License Link / Documentation URL**: https://huggingface.co/openai/clip-vit-base-patch32
- **Rate Limits (if any)**: None (local inference)
- **Commercial Use Allowed**:
  - [✔] Yes
  - [ ] No
  - [ ] Unclear

---

### API / Service Entry
- **API / Service Name**: MongoDB
- **Provider / Organization**: MongoDB Inc.
- **Purpose in Project**: Store detection logs and dynamic object memory
- **API Type**:
  - [✔] REST
  - [ ] GraphQL
  - [✔] SDK
  - [ ] Other (specify)
- **License Type**:
  - [ ] Open Source
  - [✔] Free Tier
  - [ ] Academic
  - [ ] Commercial
- **License Link / Documentation URL**: https://www.mongodb.com/
- **Rate Limits (if any)**: Depends on deployment
- **Commercial Use Allowed**:
  - [✔] Yes
  - [ ] No
  - [ ] Unclear

---

## 2. API Keys & Credentials Declaration

- **API Key Source**:
  - [✔] Self-generated from official provider
  - [ ] Hackathon-provided key
  - [✔] Open / Keyless API

- **Key Storage Method**:
  - [✔] Environment Variables
  - [ ] Secure Vault
  - [✔] Backend-only (not exposed)

- **Hardcoded in Repository**:
  - [ ] Yes 
  - [✔] No 

---

## 3. Open Source Libraries & Frameworks

| Name | Version | Purpose | License |
|------|--------|---------|---------|
| React | 18.x | Frontend UI | MIT |
| Vite | Latest | Frontend build tool | MIT |
| Node.js | 18+ | Backend server | MIT |
| Express.js | 4.x | API layer | MIT |
| MongoDB | Latest | Database | SSPL |
| FastAPI | Latest | Python API | MIT |
| Transformers | Latest | AI models | Apache 2.0 |
| PyTorch | Latest | Deep learning | BSD |
| NumPy | Latest | Numerical ops | BSD |
| OpenCV | Latest | Image processing | Apache 2.0 |
| Multer | Latest | File upload | MIT |
| Axios | Latest | HTTP requests | MIT |

---

## 4. AI Models, Tools & Agents Used

### AI Models
- **Model Name**: Grounding DINO (tiny)
- **Provider**: IDEA Research (Hugging Face)
- **Used For**: Zero-shot object detection
- **Access Method**:
  - [ ] API
  - [✔] Local Model
  - [ ] Hosted Platform

---

### AI Models
- **Model Name**: CLIP (ViT-B/32)
- **Provider**: OpenAI (Hugging Face)
- **Used For**: Image-text embedding & similarity
- **Access Method**:
  - [ ] API
  - [✔] Local Model
  - [ ] Hosted Platform

---

### AI Tools / Platforms
- **Tool Name**: Hugging Face Transformers
- **Role in Project**: Model loading and inference
- **Level of Dependency**:
  - [✔] Core Logic
  - [ ] Assistive
  - [ ] Entire Solution

---

## 5. AI Agent Usage Declaration (IMPORTANT)

- **AI Agents Used**:
  - [✔] None
  - [ ] Yes (list below)

---

## 6. Restricted / Discouraged AI Services

- No restricted or autonomous app-building AI platforms used  
- System architecture and logic fully designed by team  

---

## 7. Originality & Human Contribution Statement

- The system architecture (React + Node + FastAPI pipeline) was fully designed and implemented by the team  
- Quantum-inspired similarity logic was manually implemented using mathematical formulation  
- Dynamic object memory system (MongoDB integration) was designed to solve the problem statement  
- AI models (CLIP, Grounding DINO) were used as components, not as complete solutions  
- AI tools were used only for assistance (debugging, learning), not for full system generation  

**Uniqueness:**
- Combines zero-shot detection + quantum similarity + dynamic memory  
- Enables adding new objects without retraining  
- Transforms static detection into a continuously evolving system  

---

## 8. Ethical, Legal & Compliance Checklist

- [✔] No copyrighted data used without permission
- [✔] No leaked or private datasets
- [✔] API usage complies with provider TOS
- [✔] No malicious automation or scraping
- [✔] No AI-generated plagiarism

---

## 9. Final Declaration

> We confirm that all information provided above is accurate.  
> We understand that misrepresentation may lead to disqualification.

**Team Representative Name**: Khundongbam Albert Singh
