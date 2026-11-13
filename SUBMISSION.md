# Devpost Submission Template & Video Walkthrough Guide

Use this document to quickly fill out your Devpost submission form and record your 3-minute video.

---

## 📌 Project Submission Details

- **Project Name:** OmniScribe Hybrid AI
- **Elevator Pitch:** A privacy-first hybrid generative AI studio combining on-device Gemini Nano 4 and Firebase AI Logic cloud models for confidential document synthesis, zero-data-egress PII redaction, and multimodal intelligence.
- **Platform Category:** Web (Chrome)
- **License:** Apache License 2.0 (included in root repository)

---

## 💡 Devpost Text Description (Copy & Paste Ready)

### Inspiration
Enterprise, clinical, legal, and financial workflows frequently handle sensitive data—such as patient health records (PHI), board room negotiations, and financial ledgers. Sending every minor prompt, summarization, or text scrub to public cloud servers poses compliance risks (HIPAA, GDPR), adds latency, and creates high recurring API expenses. 

With the release of **Firebase AI Logic Hybrid Inference**, developers no longer have to choose between strict local-only limitations or expensive cloud-only architectures. We built **OmniScribe Hybrid AI** to demonstrate the transformative potential of running fast, private tasks on-device with Gemini Nano while seamlessly falling back to Google Cloud's Gemini 2.5 Flash when deep reasoning or multimodal capabilities are required.

### What It Does
- **Adaptive Hybrid Orchestration:** Automatically routes requests using Firebase AI Logic's `InferenceMode.PREFER_ON_DEVICE`.
- **Zero-Data-Egress PII Redaction:** Identifies and sanitizes patient names, clinician credentials, MRNs, phone numbers, and dates of birth directly on the user's device without transmitting any data over the network.
- **Instant Executive Summaries & Action Items:** Generates structured TL;DRs and priority checklists with sub-50ms on-device response times.
- **Cloud Boost with Multimodal Analysis:** Automatically escalates complex multimodal requests (invoices, receipts, handwritten diagrams) to Gemini 2.5 Flash via Firebase AI Logic.
- **Live Hybrid Telemetry Dashboard:** Displays real-time metrics including execution source, round-trip latency, token footprint, and financial savings ($0 for on-device compute).
- **Enterprise Security & Sync:** Protected by **Firebase App Check** to prevent unauthorized cloud endpoint access, governed by **Firebase Remote Config** for dynamic policy updates, and synced across devices with **Cloud Firestore** and **Firebase Authentication**.

### How We Built It
- **Frontend:** Built with Bootstrap 5.3 CSS, responsive glassmorphism components, and Bootstrap Icons. Pure ES Modules in `index.html` ensure zero-build overhead and instant Vercel deployment.
- **Firebase AI Logic (`firebase/ai`):** Initializes generative models with `GoogleAIBackend` and hybrid execution preferences.
- **Chrome Built-in AI / Prompt API:** Integrates with `window.ai.languageModel` for native Gemini Nano execution on supported Chrome browsers.
- **Firebase App Check:** Integrated with debug token verification for development and hackathon evaluation.
- **Firebase Remote Config:** Dynamically manages fallback model selection, token thresholds, and PII enforcement flags.
- **Firebase Firestore & Auth:** Supports instant anonymous guest sessions and Google Sign-In with offline-first local synchronization.

### Challenges We Overcame
1. Managing the transition between experimental Chrome Prompt API specifications and cloud fallback models while keeping the user interface completely responsive.
2. Building an accurate real-time telemetry model that calculates token savings and provides transparent feedback on why a specific route was chosen.

### What We Learned
Hybrid inference is the future of client-side application design. Offloading high-frequency micro-prompts to local Gemini Nano models dramatically reduces cloud API consumption while enhancing user privacy.

---

## 🎬 3-Minute Demonstration Video Script

Keep your recording under 3 minutes (e.g., 2 minutes and 45 seconds):

| Timestamp | Screen Action | Voiceover Script |
| :--- | :--- | :--- |
| **0:00 - 0:30** | Show OmniScribe loaded in browser with Bootstrap UI. Point out the top badges: Gemini Nano Ready, Firebase AI Logic Connected, App Check Active. | "Hi everyone! Welcome to OmniScribe Hybrid AI, built for the #BuildHybridAI hackathon. Everyday professionals in healthcare, finance, and law handle sensitive documents. Sending every prompt to the cloud is slow, expensive, and risks regulatory compliance. OmniScribe solves this using Firebase AI Logic Hybrid Inference." |
| **0:30 - 1:15** | Click the **🩺 Clinical PHI Note** demo scenario. Show the patient encounter text. Ensure mode is set to **Strict Local** or **Auto Hybrid**. Click **Redact PII (Local)**. | "Here we have a clinical consultation note containing protected health information. Because patient confidentiality is critical, our hybrid engine processes this on-device using Gemini Nano. Notice in our telemetry dashboard: execution latency was just 32 milliseconds, cloud cost was zero dollars, and zero network packets left the machine. Names, MRNs, and dates of birth were redacted locally." |
| **1:15 - 1:55** | Switch to the **💼 Project Titan Minutes** scenario. Click **Auto-Summarize**, then click the **Document Chat** tab and ask a question: *"What was the approved budget for the acquisition?"* | "Next, let's look at confidential board minutes. With one click, our on-device engine produces a structured executive summary and extracts action items. We can also chat directly with the document in real time, getting instant answers without cloud delay." |
| **1:55 - 2:25** | Click **Attach Image** and select a document image/receipt. Switch to **Cloud Boost**. Click **Auto-Summarize**. | "When we need deep multimodal reasoning, such as analyzing an attached invoice or complex technical diagram, Firebase AI Logic seamlessly routes the payload to Gemini 2.5 Flash in the cloud, safeguarded by Firebase App Check." |
| **2:25 - 2:50** | Click the **Diagnostics** button in the navbar. Click **Run Benchmark**. Show the comparative table. | "Finally, our built-in hardware diagnostics tool probes Chrome's Prompt API, WebGPU acceleration, and runs a live comparative benchmark between local and cloud routes. OmniScribe is fully open-source, deployable on Vercel, and built for the future of hybrid AI. Thank you!" |
