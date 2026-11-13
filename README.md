# OmniScribe Hybrid AI

> **Next-Gen Privacy-First Document & Knowledge Studio powered by Firebase AI Logic and Chrome Gemini Nano 4.**  
> Built for the **#BuildHybridAI** Hackathon.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20(Chrome%20Gemini%20Nano%204)-orange.svg)](https://developer.chrome.com/docs/ai/built-in)
[![Firebase AI Logic](https://img.shields.io/badge/Firebase-AI%20Logic%20Hybrid%20SDK-yellow.svg)](https://firebase.google.com/docs/ai-logic/hybrid)
[![CSS Framework](https://img.shields.io/badge/CSS-Bootstrap%205.3-purple.svg)](https://getbootstrap.com)

---

## 🌟 Overview & Core Value Proposition

In healthcare, corporate governance, legal affairs, and personal productivity, users routinely handle highly sensitive data:
- **Clinical consultation notes & patient records (PHI/PII)**
- **Executive board minutes, M&A acquisitions, and confidential NDAs**
- **Financial audit ledgers and payroll data**

Transmitting every keystroke or text transformation to public cloud APIs creates **regulatory compliance exposure (HIPAA, GDPR)**, introduces unnecessary network latency, and generates massive recurring cloud API costs.

**OmniScribe Hybrid AI** delivers a unified hybrid architecture:
1. **On-Device by Default (Gemini Nano 4 via Chrome Built-in AI & Firebase AI Logic)**:
   - Micro-summaries, sensitive entity redaction, action item extraction, and quick revisions execute **100% locally on the device**.
   - **$0 cloud inference cost**, **sub-50ms latency**, full offline reliability, and **guaranteed zero data egress**.
2. **Cloud Boost via Firebase AI Logic**:
   - For multimodal document analysis (e.g., invoices, scans, diagrams), long documents exceeding device context, or devices lacking on-device model weights, the SDK automatically escalates execution to **Gemini 2.5 Flash** with **Firebase App Check** verification.

---

## 🏗️ Technical Architecture & Firebase Products Used

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OmniScribe Web Client                           │
│       (Bootstrap 5.3 + ES Modules • index.html Single Page App)        │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
    [On-Device Route: Local Ready]     [Cloud Route: Boost / Fallback]
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐       ┌────────────────────────┐
       │   Chrome Gemini Nano   │       │   Firebase AI Logic    │
       │    (W3C Prompt API)    │       │ (Gemini 2.5 Flash API) │
       │  • Zero-Data Egress    │       │  • Multimodal Vision   │
       │  • 0ms Cloud Cost      │       │  • Deep Reasoning      │
       └────────────────────────┘       └────────────┬───────────┘
                                                     │
               ┌─────────────────────────────────────┴──────────────────┐
               │                                                        │
               ▼                                                        ▼
    ┌──────────────────────┐                                 ┌──────────────────────┐
    │  Firebase App Check  │                                 │Firebase Remote Config│
    │ (Debug / ReCAPTCHA)  │                                 │ (Model & Thresholds) │
    └──────────────────────┘                                 └──────────────────────┘
               │                                                        │
               └──────────────────────┬─────────────────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │  Firebase Authentication  │
                        │   & Cloud Firestore Sync  │
                        └───────────────────────────┘
```

- **Firebase AI Logic Hybrid Inference (`firebase/ai`)**: Configured with `InferenceMode.PREFER_ON_DEVICE` to dynamically steer tasks between local Gemini Nano and cloud endpoints.
- **Firebase App Check (`firebase/app-check`)**: Verifies app authenticity, blocking scraper bots and protecting backend API quotas.
- **Firebase Remote Config (`firebase/remote-config`)**: Remotely controls cloud fallback models (`gemini-2.5-flash-lite`), token thresholds, and PII enforcement policies.
- **Firebase Cloud Firestore (`firebase/firestore`)**: Synchronizes documents and intelligence records across sessions with offline-first local cache fallback.
- **Firebase Authentication (`firebase/auth`)**: Instant 1-click anonymous guest authentication for friction-free evaluation, with optional Google Sign-In.

---

## ⚡ Key Features

1. **Intelligent Hybrid Inference Modes**:
   - `⚡ Auto Hybrid`: Automatically runs on-device if available, falling back to cloud for large payloads or complex queries.
   - `🔒 Strict On-Device`: Enforces 100% local processing for zero data egress compliance.
   - `☁️ Cloud Boost`: Leverages Gemini 2.5 Flash for deep synthesis and multimodal analysis.
2. **Built-in GenAI Workflows**:
   - **Executive Summarizer**: TL;DR, core takeaways, and operational recommendations.
   - **Smart PII & PHI Redaction**: On-device entity masking (names, MRNs, phone numbers, SSNs, credit cards).
   - **Action Item Extractor**: Parses deadlines, assigned owners, and action points.
   - **Multi-Turn Document Chat**: Context-grounded conversation with the active document.
   - **Multimodal Document Inspection**: Upload receipts, invoices, or charts for optical analysis.
3. **Live Hybrid Telemetry Dashboard**:
   - Visualizes execution engine, execution time (ms), cost calculation ($0 on-device vs cloud), token footprint, and privacy status in real-time.
4. **Hardware & Gemini Nano Diagnostics**:
   - Probes `window.ai`, Prompt API capabilities, WebGPU acceleration, and hardware concurrency with a comparative benchmark.

---

## 🚀 Quick Start & Local Development

### Prerequisites
- Any modern web browser (Google Chrome Desktop 138+ recommended for native Gemini Nano).
- Optional: Python or Node.js for running a local static server.

### Running Locally
Clone the repository and serve the root directory:

```bash
# Using Python
python -m http.server 3000

# OR using npx
npx serve . -p 3000
```

Open your browser at `http://localhost:3000`.

### Enabling Native Gemini Nano in Google Chrome
To experience native on-device hardware acceleration:
1. Open `chrome://flags` in Google Chrome (Desktop 138+).
2. Set **Prompt API for Gemini Nano** to `Enabled`.
3. Set **Enables optimization guide on device** to `Enabled BypassPerfRequirement`.
4. Relaunch Chrome, open `chrome://components`, and ensure **Optimization Guide On Device Model** is up to date.

---

## 🌐 Deploying to Vercel

OmniScribe is pre-configured with `vercel.json` for zero-configuration, instant deployment:

1. Push your code to a public GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Click **Deploy**. Vercel will immediately serve `index.html` with production headers and caching enabled.

---

## 📋 What You Need To Do From Your End (Submission Checklist)

1. **Firebase Project Setup (Optional for Demo Mode, Recommended for Live Cloud)**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a project and register a Web App.
   - Enable **Firebase AI Logic** (`npx firebase-tools init ailogic` or enable Gemini Developer API).
   - Enable **Authentication** (Anonymous + Google).
   - Enable **Cloud Firestore** and deploy `firestore.rules`.
   - In the OmniScribe UI, click the **Config** button in the top navbar and paste your Firebase keys & App Check Debug Token.
2. **Record Your Demo Video (Under 3 Minutes)**:
   - Follow the pre-written script in [SUBMISSION.md](SUBMISSION.md).
   - Demonstrate:
     1. Quick scenario loading (e.g. Clinical Note).
     2. On-device PII redaction and Auto-summarize with live telemetry.
     3. Mode switching to Cloud Boost / Multimodal image analysis.
     4. Hardware diagnostics benchmark.
   - Upload the video to YouTube (public or unlisted) with English audio or subtitles.
3. **Devpost Submission**:
   - Submit under the **Web (Chrome)** category.
   - Provide your public GitHub repository URL and your live Vercel deployment URL.

---

## 📄 License

This project is licensed under the [Apache License, Version 2.0](LICENSE).
