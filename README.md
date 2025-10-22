# 🎬 Reelixx — AI Short-Form Ad Generator

Reelixx automatically turns a **product webpage or description** into a **ready-to-share short-form video ad (9:16)** — complete with:
- 🎙️ **AI Voiceovers (TTS)**
- 🖼️ **Generated Scene Images**
- 🎵 **Music Auto-Mixing**
- 🧩 **Script & Storyboard Generation**
- 📽️ **Final MP4 Export**

This project demonstrates a **modular AI-powered video creation pipeline** — built with real production-style code (FastAPI + MoviePy + OpenAI SDK).  
It can also run in **zero-cost demo mode**, rendering videos **without** using any paid APIs.

---

## 🧠 Core Features

| Feature | Description |
|----------|--------------|
| 🧾 **AI Script + Storyboard** | Generates ad scripts and shot lists from text or product URLs |
| 🖼️ **Image Generation** | Uses OpenAI image models (gpt-image-1) for cinematic ad frames |
| 🎙️ **Voice Generation** | High-quality TTS with emotion-adaptive voices |
| 🎵 **Music Ducking + Mix** | Automatic background music synced with narration |
| 📽️ **Video Composition** | Combines visuals, voice, and music into a 9:16 vertical MP4 |
| 💾 **Stub Renderer (Offline)** | Works without API calls — uses Pillow + MoviePy |
| ⚡ **FastAPI Backend** | Modular endpoints for AI, export, and scrape automation |

---

## 🧩 Tech Stack

**Backend:**
- Python 3.11+
- FastAPI + Uvicorn
- MoviePy, Pillow, NumPy, pydub
- OpenAI SDK (images, TTS)
- SQLAlchemy (SQLite for dev)

**Frontend:**
- Next.js (App Router)
- Tailwind CSS
- Axios API integration

