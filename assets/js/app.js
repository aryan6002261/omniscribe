/**
 * OmniScribe Hybrid AI - Main Application Controller
 * Connects Bootstrap UI, NanoDetector, FirebaseService, and user interactions.
 */

import { NanoDetector } from "./nano-detector.js";
import { FirebaseService } from "./firebase-service.js";
import { SAMPLE_SCENARIOS } from "./sample-data.js";
import {
  saveUserFirebaseConfig,
  saveAppCheckDebugToken,
  saveUserSettings,
  loadUserFirebaseConfig,
  loadAppCheckDebugToken,
  loadUserSettings
} from "./config.js";

class OmniScribeApp {
  constructor() {
    this.nano = new NanoDetector();
    this.firebase = new FirebaseService(this.nano);

    this.currentDocId = "doc-" + Date.now();
    this.currentMode = "auto"; // "auto", "local", "cloud"
    this.currentTask = "summary";
    this.activeImageBase64 = null;
    this.chatHistory = [];

    // DOM Elements
    this.dom = {};
  }

  async init() {
    this.cacheDomElements();
    this.bindEvents();
    this.loadSavedSettingsIntoModals();
    this.renderSavedNotesList();

    // 1. Probe local Chrome Gemini Nano hardware
    this.updateHardwareBadge("checking", "Probing Gemini Nano & Prompt API...");
    const nanoInfo = await this.nano.probeCapabilities();
    this.handleNanoProbeResult(nanoInfo);

    // 2. Initialize Firebase backend (AI Logic, App Check, Auth, Remote Config, Firestore)
    this.updateCloudStatusBadge("checking", "Connecting to Firebase AI Logic...");
    await this.firebase.initialize();
    this.updateCloudStatusBadge("ready", "Firebase AI Logic Hybrid Connected");

    // 3. Auto sign-in guest for instant friction-free testing
    this.firebase.onAuthChange((user) => this.handleAuthStateChange(user));
    await this.firebase.signInAnonymousUser();

    // 4. Load initial sample scenario
    this.loadScenario("clinical");
  }

  cacheDomElements() {
    this.dom = {
      // Badges
      nanoBadge: document.getElementById("nanoBadge"),
      cloudBadge: document.getElementById("cloudBadge"),
      appCheckBadge: document.getElementById("appCheckBadge"),
      privacyBadge: document.getElementById("privacyBadge"),

      // Mode toggles
      modeAuto: document.getElementById("modeAuto"),
      modeLocal: document.getElementById("modeLocal"),
      modeCloud: document.getElementById("modeCloud"),
      modePill: document.getElementById("currentModePill"),

      // Editor & Content
      docTitleInput: document.getElementById("docTitleInput"),
      docCategoryBadge: document.getElementById("docCategoryBadge"),
      docContentTextarea: document.getElementById("docContentTextarea"),
      charCounter: document.getElementById("charCounter"),
      tokenCounter: document.getElementById("tokenCounter"),

      // Action Buttons
      btnSummarize: document.getElementById("btnSummarize"),
      btnRedact: document.getElementById("btnRedact"),
      btnActionItems: document.getElementById("btnActionItems"),
      btnKeyPoints: document.getElementById("btnKeyPoints"),
      btnSaveDoc: document.getElementById("btnSaveDoc"),
      btnNewDoc: document.getElementById("btnNewDoc"),
      btnExportDoc: document.getElementById("btnExportDoc"),

      // Output & Telemetry
      outputContainer: document.getElementById("outputContainer"),
      outputPlaceholder: document.getElementById("outputPlaceholder"),
      outputContent: document.getElementById("outputContent"),
      outputLoading: document.getElementById("outputLoading"),
      btnCopyOutput: document.getElementById("btnCopyOutput"),

      // Telemetry Cards
      telemetrySource: document.getElementById("telemetrySource"),
      telemetryLatency: document.getElementById("telemetryLatency"),
      telemetryCost: document.getElementById("telemetryCost"),
      telemetryTokens: document.getElementById("telemetryTokens"),
      telemetryReason: document.getElementById("telemetryReason"),

      // Multimodal
      imageFileInput: document.getElementById("imageFileInput"),
      imagePreviewCard: document.getElementById("imagePreviewCard"),
      imagePreviewImg: document.getElementById("imagePreviewImg"),
      btnRemoveImage: document.getElementById("btnRemoveImage"),

      // Chat
      chatMessagesContainer: document.getElementById("chatMessagesContainer"),
      chatInput: document.getElementById("chatInput"),
      btnSendChat: document.getElementById("btnSendChat"),

      // Notes List
      savedNotesContainer: document.getElementById("savedNotesContainer"),

      // User & Modals
      userNameDisplay: document.getElementById("userNameDisplay"),
      btnSignInGoogle: document.getElementById("btnSignInGoogle"),
      btnSignOut: document.getElementById("btnSignOut"),
      modalFirebaseSettings: new bootstrap.Modal(document.getElementById("modalFirebaseSettings")),
      modalDiagnostics: new bootstrap.Modal(document.getElementById("modalDiagnostics")),
      diagResultsBody: document.getElementById("diagResultsBody"),
      btnRunDiagBenchmark: document.getElementById("btnRunDiagBenchmark"),

      // Settings Form Inputs
      inputApiKey: document.getElementById("inputApiKey"),
      inputAuthDomain: document.getElementById("inputAuthDomain"),
      inputProjectId: document.getElementById("inputProjectId"),
      inputAppId: document.getElementById("inputAppId"),
      inputAppCheckToken: document.getElementById("inputAppCheckToken"),
      selectCloudModel: document.getElementById("selectCloudModel"),
      inputLocalThreshold: document.getElementById("inputLocalThreshold"),
      btnSaveSettings: document.getElementById("btnSaveSettings")
    };
  }

  bindEvents() {
    // Mode toggles
    this.dom.modeAuto.addEventListener("change", () => this.setInferenceMode("auto"));
    this.dom.modeLocal.addEventListener("change", () => this.setInferenceMode("local"));
    this.dom.modeCloud.addEventListener("change", () => this.setInferenceMode("cloud"));

    // Scenario buttons
    document.querySelectorAll("[data-scenario-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-scenario-id");
        this.loadScenario(id);
      });
    });

    // Editor inputs
    this.dom.docContentTextarea.addEventListener("input", () => this.updateCounters());

    // GenAI Actions
    this.dom.btnSummarize.addEventListener("click", () => this.runGenAITask("summary", "Summarize this document with an executive TL;DR, key findings, and operational recommendations."));
    this.dom.btnRedact.addEventListener("click", () => this.runGenAITask("redact", "Detect and redact all Personally Identifiable Information (PII) and Protected Health Information (PHI) such as patient/physician names, MRNs, dates of birth, phone numbers, and addresses with zero-data-egress."));
    this.dom.btnActionItems.addEventListener("click", () => this.runGenAITask("action_items", "Extract all key action items, owners, deadlines, and operational priorities."));
    this.dom.btnKeyPoints.addEventListener("click", () => this.runGenAITask("key_points", "Synthesize the top 5 strategic takeaways and insights."));

    // Multimodal image handler
    this.dom.imageFileInput.addEventListener("change", (e) => this.handleImageUpload(e));
    this.dom.btnRemoveImage.addEventListener("click", () => this.clearActiveImage());

    // Chat
    this.dom.btnSendChat.addEventListener("click", () => this.sendChatMessage());
    this.dom.chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendChatMessage();
      }
    });

    // Document Management
    this.dom.btnSaveDoc.addEventListener("click", () => this.saveCurrentDocument());
    this.dom.btnNewDoc.addEventListener("click", () => this.resetNewDocument());
    this.dom.btnExportDoc.addEventListener("click", () => this.exportDocument());
    this.dom.btnCopyOutput.addEventListener("click", () => this.copyOutputToClipboard());

    // Diagnostics & Benchmark
    this.dom.btnRunDiagBenchmark.addEventListener("click", () => this.runDiagnosticsBenchmark());

    // Settings save
    this.dom.btnSaveSettings.addEventListener("click", () => this.saveSettingsFromForm());

    // Auth buttons
    this.dom.btnSignInGoogle.addEventListener("click", () => this.signInGoogle());
    this.dom.btnSignOut.addEventListener("click", () => this.firebase.signOutUser());
  }

  setInferenceMode(mode) {
    this.currentMode = mode;
    if (mode === "auto") {
      this.dom.modePill.className = "badge bg-primary text-white";
      this.dom.modePill.innerHTML = `<i class="bi bi-cpu-fill me-1"></i> Auto Hybrid (PREFER_ON_DEVICE)`;
      this.dom.privacyBadge.innerHTML = `<i class="bi bi-shield-check text-primary me-1"></i> Smart Hybrid Routing`;
    } else if (mode === "local") {
      this.dom.modePill.className = "badge bg-success text-white";
      this.dom.modePill.innerHTML = `<i class="bi bi-shield-lock-fill me-1"></i> Strict On-Device (Zero Egress)`;
      this.dom.privacyBadge.innerHTML = `<i class="bi bi-shield-lock-fill text-success me-1"></i> 100% Zero-Data-Egress`;
    } else {
      this.dom.modePill.className = "badge bg-info text-dark";
      this.dom.modePill.innerHTML = `<i class="bi bi-cloud-arrow-up-fill me-1"></i> Cloud Boost (Gemini 2.5 Flash)`;
      this.dom.privacyBadge.innerHTML = `<i class="bi bi-cloud-check text-info me-1"></i> App Check Verified Cloud`;
    }
    this.showToast(`Switched inference mode to: ${this.dom.modePill.innerText}`);
  }

  loadScenario(scenarioId) {
    const scenario = SAMPLE_SCENARIOS[scenarioId];
    if (!scenario) return;

    this.currentDocId = "scenario-" + scenario.id;
    this.dom.docTitleInput.value = scenario.title;
    this.dom.docCategoryBadge.innerText = scenario.category;
    this.dom.docContentTextarea.value = scenario.content;
    this.clearActiveImage();
    this.updateCounters();

    // Auto switch recommended mode for scenario
    if (scenario.recommendedMode === "local") {
      this.dom.modeLocal.checked = true;
      this.setInferenceMode("local");
    } else if (scenario.recommendedMode === "cloud") {
      this.dom.modeCloud.checked = true;
      this.setInferenceMode("cloud");
    } else {
      this.dom.modeAuto.checked = true;
      this.setInferenceMode("auto");
    }

    this.showToast(`Loaded scenario: ${scenario.title}`);
  }

  updateCounters() {
    const text = this.dom.docContentTextarea.value || "";
    const chars = text.length;
    const estimatedTokens = Math.round(chars / 4);
    this.dom.charCounter.innerText = `${chars.toLocaleString()} characters`;
    this.dom.tokenCounter.innerText = `~${estimatedTokens.toLocaleString()} tokens`;
  }

  handleNanoProbeResult(nanoInfo) {
    if (nanoInfo.status === "ready") {
      this.updateHardwareBadge("ready", "Gemini Nano: Ready (On-Device)");
    } else if (nanoInfo.status === "after-download") {
      this.updateHardwareBadge("downloading", "Gemini Nano: Downloading Weights");
    } else {
      this.updateHardwareBadge("simulated", "Gemini Nano: Active (Hybrid Fallback)");
    }
  }

  updateHardwareBadge(state, text) {
    const badge = this.dom.nanoBadge;
    if (state === "ready") {
      badge.className = "badge bg-success-subtle text-success border border-success px-2 py-1";
      badge.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> ${text}`;
    } else if (state === "downloading") {
      badge.className = "badge bg-warning-subtle text-warning border border-warning px-2 py-1";
      badge.innerHTML = `<i class="bi bi-arrow-down-circle-fill me-1"></i> ${text}`;
    } else if (state === "simulated") {
      badge.className = "badge bg-primary-subtle text-primary border border-primary px-2 py-1";
      badge.innerHTML = `<i class="bi bi-cpu-fill me-1"></i> ${text}`;
    } else {
      badge.className = "badge bg-secondary-subtle text-secondary border border-secondary px-2 py-1";
      badge.innerHTML = `<i class="bi bi-hourglass-split me-1"></i> ${text}`;
    }
  }

  updateCloudStatusBadge(state, text) {
    const badge = this.dom.cloudBadge;
    if (state === "ready") {
      badge.className = "badge bg-info-subtle text-info-emphasis border border-info px-2 py-1";
      badge.innerHTML = `<i class="bi bi-clouds-fill me-1"></i> ${text}`;
    } else {
      badge.className = "badge bg-secondary-subtle text-secondary border border-secondary px-2 py-1";
      badge.innerHTML = `<i class="bi bi-arrow-repeat spin me-1"></i> ${text}`;
    }
  }

  async runGenAITask(taskType, instruction) {
    const content = this.dom.docContentTextarea.value.trim();
    if (!content && !this.activeImageBase64) {
      this.showToast("Please enter document text or upload an image first.", "warning");
      return;
    }

    this.currentTask = taskType;
    this.showOutputLoading(true);

    const fullPrompt = `${instruction}\n\nDocument Text:\n"""\n${content}\n"""`;
    const systemPrompt = "You are OmniScribe Hybrid AI, an intelligent, privacy-first document and knowledge assistant.";

    try {
      // Execute reCAPTCHA Enterprise verification on user interaction
      await this.firebase.executeReCaptcha(`PROMPT_${taskType.toUpperCase()}`);

      const result = await this.firebase.executeHybridInference({
        prompt: fullPrompt,
        systemInstruction: systemPrompt,
        mode: this.currentMode,
        taskType: taskType,
        imageData: this.activeImageBase64
      });

      this.renderOutput(result.text);
      this.renderTelemetry(result.telemetry);
    } catch (err) {
      console.error("GenAI execution error:", err);
      this.renderOutput(`### ⚠️ Execution Notice\n${err.message}`);
    } finally {
      this.showOutputLoading(false);
    }
  }

  renderOutput(markdownText) {
    this.dom.outputPlaceholder.classList.add("d-none");
    this.dom.outputContent.classList.remove("d-none");
    // Convert basic markdown to styled HTML
    this.dom.outputContent.innerHTML = this.formatMarkdown(markdownText);
  }

  renderTelemetry(telemetry) {
    const isLocal = telemetry.finalSource.startsWith("on-device");
    
    // Engine / Source
    this.dom.telemetrySource.className = isLocal ? "text-success fw-bold" : "text-info fw-bold";
    this.dom.telemetrySource.innerHTML = isLocal 
      ? `<i class="bi bi-cpu-fill me-1"></i> ${telemetry.modelName}`
      : `<i class="bi bi-cloud-check-fill me-1"></i> ${telemetry.modelName}`;

    // Latency
    this.dom.telemetryLatency.innerText = `${telemetry.latencyMs} ms`;

    // Cost & Savings
    if (isLocal) {
      this.dom.telemetryCost.innerHTML = `<span class="badge bg-success">$0.0000 (Free)</span> <small class="text-success ms-1">Saved ~$${telemetry.costSavings}</small>`;
    } else {
      this.dom.telemetryCost.innerHTML = `<span class="badge bg-info text-dark">$${telemetry.costEstimate}</span>`;
    }

    // Tokens
    this.dom.telemetryTokens.innerText = `${telemetry.totalTokens} tokens (In: ${telemetry.inputTokens} | Out: ${telemetry.outputTokens})`;

    // Reason
    this.dom.telemetryReason.innerText = telemetry.executionReason;
  }

  showOutputLoading(isLoading) {
    if (isLoading) {
      this.dom.outputLoading.classList.remove("d-none");
      this.dom.outputPlaceholder.classList.add("d-none");
      this.dom.outputContent.classList.add("d-none");
    } else {
      this.dom.outputLoading.classList.add("d-none");
    }
  }

  // ==========================================
  // MULTIMODAL IMAGE ANALYSIS
  // ==========================================

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      this.showToast("Please select an image file (PNG, JPG, WebP).", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      this.activeImageBase64 = event.target.result;
      this.dom.imagePreviewImg.src = this.activeImageBase64;
      this.dom.imagePreviewCard.classList.remove("d-none");
      this.showToast("Document image attached. Multimodal analysis ready!");
      // Multimodal naturally prefers cloud boost
      this.dom.modeCloud.checked = true;
      this.setInferenceMode("cloud");
    };
    reader.readAsDataURL(file);
  }

  clearActiveImage() {
    this.activeImageBase64 = null;
    this.dom.imageFileInput.value = "";
    this.dom.imagePreviewCard.classList.add("d-none");
    this.dom.imagePreviewImg.src = "";
  }

  // ==========================================
  // MULTI-TURN DOCUMENT CHAT
  // ==========================================

  async sendChatMessage() {
    const message = this.dom.chatInput.value.trim();
    if (!message) return;

    this.dom.chatInput.value = "";
    this.appendChatMessage("user", message);

    const docContext = this.dom.docContentTextarea.value.trim();
    const prompt = `Document Context:\n"""\n${docContext}\n"""\n\nUser Question: ${message}`;
    const systemPrompt = "You are OmniScribe Hybrid AI. Answer questions accurately based on the provided document context with high precision.";

    // Show temporary typing indicator
    const typingElem = this.appendChatMessage("assistant", `<i class="bi bi-hourglass-split spin me-1"></i> Thinking...`);

    try {
      // Execute reCAPTCHA Enterprise verification for chat action
      await this.firebase.executeReCaptcha('CHAT_PROMPT');

      const result = await this.firebase.executeHybridInference({
        prompt: prompt,
        systemInstruction: systemPrompt,
        mode: this.currentMode,
        taskType: "chat"
      });

      typingElem.innerHTML = this.formatMarkdown(result.text);
      this.renderTelemetry(result.telemetry);
    } catch (err) {
      typingElem.innerHTML = `<span class="text-danger">Error: ${err.message}</span>`;
    }
  }

  appendChatMessage(role, html) {
    const div = document.createElement("div");
    div.className = `chat-bubble chat-${role} mb-3 p-3 rounded-3 ${role === "user" ? "bg-primary text-white ms-auto" : "bg-body-secondary text-body"}`;
    div.style.maxWidth = "88%";
    div.innerHTML = `<strong>${role === "user" ? "You" : "OmniScribe AI"}:</strong><div class="mt-1">${html}</div>`;
    this.dom.chatMessagesContainer.appendChild(div);
    this.dom.chatMessagesContainer.scrollTop = this.dom.chatMessagesContainer.scrollHeight;
    return div.querySelector("div");
  }

  // ==========================================
  // DOCUMENT MANAGEMENT & FIRESTORE
  // ==========================================

  async saveCurrentDocument() {
    // Execute reCAPTCHA Enterprise verification for document persistence
    await this.firebase.executeReCaptcha('SAVE_DOCUMENT');

    const title = this.dom.docTitleInput.value.trim() || "Untitled Knowledge Document";
    const content = this.dom.docContentTextarea.value.trim();
    const category = this.dom.docCategoryBadge.innerText;

    const docRecord = {
      id: this.currentDocId,
      title,
      category,
      content,
      modeUsed: this.currentMode,
      savedAt: new Date().toLocaleTimeString()
    };

    await this.firebase.saveNoteToFirestore(docRecord);
    this.renderSavedNotesList();
    this.showToast("Document saved locally and synchronized with Cloud Firestore!");
  }

  renderSavedNotesList() {
    const notes = this.firebase.getLocalNotes();
    const container = this.dom.savedNotesContainer;
    container.innerHTML = "";

    if (notes.length === 0) {
      container.innerHTML = `<div class="p-3 text-muted text-center small"><i class="bi bi-folder2-open d-block fs-4 mb-1"></i>No saved documents yet.</div>`;
      return;
    }

    notes.forEach(note => {
      const item = document.createElement("div");
      item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
      item.innerHTML = `
        <div class="text-truncate me-2" style="cursor: pointer;">
          <div class="fw-bold text-truncate">${note.title}</div>
          <small class="text-muted"><i class="bi bi-tag me-1"></i>${note.category || 'General'} • ${note.savedAt || ''}</small>
        </div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary btn-load-note" title="Load"><i class="bi bi-box-arrow-in-up"></i></button>
          <button class="btn btn-outline-danger btn-delete-note" title="Delete"><i class="bi bi-trash"></i></button>
        </div>
      `;

      item.querySelector(".text-truncate").addEventListener("click", () => this.loadNote(note));
      item.querySelector(".btn-load-note").addEventListener("click", () => this.loadNote(note));
      item.querySelector(".btn-delete-note").addEventListener("click", async () => {
        await this.firebase.deleteNote(note.id);
        this.renderSavedNotesList();
        this.showToast("Document removed.");
      });

      container.appendChild(item);
    });
  }

  loadNote(note) {
    this.currentDocId = note.id;
    this.dom.docTitleInput.value = note.title;
    this.dom.docCategoryBadge.innerText = note.category || "General";
    this.dom.docContentTextarea.value = note.content;
    this.updateCounters();
    this.showToast(`Loaded "${note.title}"`);
  }

  resetNewDocument() {
    this.currentDocId = "doc-" + Date.now();
    this.dom.docTitleInput.value = "New Confidential Note";
    this.dom.docCategoryBadge.innerText = "Custom";
    this.dom.docContentTextarea.value = "";
    this.clearActiveImage();
    this.updateCounters();
    this.dom.outputPlaceholder.classList.remove("d-none");
    this.dom.outputContent.classList.add("d-none");
    this.showToast("Started a new document.");
  }

  exportDocument() {
    const title = this.dom.docTitleInput.value.trim() || "OmniScribe_Document";
    const content = this.dom.docContentTextarea.value;
    const output = this.dom.outputContent.innerText || "";
    const blob = new Blob([`# ${title}\n\n## Content\n${content}\n\n## AI Analysis Output\n${output}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("Document exported as Markdown file!");
  }

  copyOutputToClipboard() {
    const text = this.dom.outputContent.innerText;
    if (!text) return;
    navigator.clipboard.writeText(text);
    this.showToast("Output copied to clipboard!");
  }

  // ==========================================
  // HARDWARE DIAGNOSTICS & BENCHMARK
  // ==========================================

  async runDiagnosticsBenchmark() {
    const body = this.dom.diagResultsBody;
    body.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary mb-2" role="status"></div>
        <p class="mb-0 text-muted">Running Chrome Prompt API probe & real-time latency benchmark...</p>
      </div>
    `;

    const nanoInfo = await this.nano.probeCapabilities();
    const benchmarkPrompt = "Summarize the key architectural benefits of on-device neural processing units (NPU) in 2 sentences.";

    // Benchmark local inference
    const t0 = performance.now();
    const localRes = await this.firebase.executeHybridInference({
      prompt: benchmarkPrompt,
      mode: "local",
      taskType: "summary"
    });
    const localLatency = Math.round(performance.now() - t0);

    // Benchmark cloud inference
    const t1 = performance.now();
    const cloudRes = await this.firebase.executeHybridInference({
      prompt: benchmarkPrompt,
      mode: "cloud",
      taskType: "summary"
    });
    const cloudLatency = Math.round(performance.now() - t1);

    body.innerHTML = `
      <div class="table-responsive">
        <table class="table table-bordered table-sm align-middle">
          <thead class="table-light">
            <tr>
              <th>Diagnostic Parameter</th>
              <th>Status / Value</th>
              <th>Assessment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Target Browser</strong></td>
              <td>${nanoInfo.details.browser}</td>
              <td><span class="badge bg-success">Supported</span></td>
            </tr>
            <tr>
              <td><strong>Chrome Prompt API (window.ai)</strong></td>
              <td>${nanoInfo.details.hasPromptAPI ? 'Detected' : 'Experimental / Flag Required'}</td>
              <td>${nanoInfo.details.hasPromptAPI ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-warning text-dark">Use chrome://flags</span>'}</td>
            </tr>
            <tr>
              <td><strong>WebGPU Hardware Acceleration</strong></td>
              <td>${nanoInfo.details.hasWebGPU ? 'Available (NPU/GPU)' : 'CPU Fallback'}</td>
              <td>${nanoInfo.details.hasWebGPU ? '<span class="badge bg-success">High Speed</span>' : '<span class="badge bg-secondary">Standard</span>'}</td>
            </tr>
            <tr>
              <td><strong>CPU Cores / Device RAM</strong></td>
              <td>${nanoInfo.details.hardwareConcurrency} Cores | ${nanoInfo.details.deviceMemory} GB</td>
              <td><span class="badge bg-info text-dark">Hardware Ready</span></td>
            </tr>
            <tr class="table-primary">
              <td><strong>⚡ On-Device Latency Benchmark</strong></td>
              <td><strong>${localLatency} ms</strong></td>
              <td><span class="badge bg-success">Instant / Zero Cost</span></td>
            </tr>
            <tr class="table-info">
              <td><strong>☁️ Cloud Route Latency Benchmark</strong></td>
              <td><strong>${cloudLatency} ms</strong></td>
              <td><span class="badge bg-info text-dark">Deep Context</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="alert alert-light border mt-3">
        <h6 class="fw-bold"><i class="bi bi-info-circle text-primary me-1"></i> How to enable native Chrome Gemini Nano:</h6>
        <ol class="small mb-0 ps-3">
          <li>Open <code>chrome://flags</code> in Google Chrome (Desktop 138+).</li>
          <li>Set <strong>Prompt API for Gemini Nano</strong> to <code>Enabled</code>.</li>
          <li>Set <strong>Enables optimization guide on device</strong> to <code>Enabled BypassPerfRequirement</code>.</li>
          <li>Relaunch Chrome and visit <code>chrome://components</code> to verify <strong>Optimization Guide On Device Model</strong> is updated.</li>
        </ol>
      </div>
    `;
  }

  // ==========================================
  // SETTINGS & AUTHENTICATION
  // ==========================================

  loadSavedSettingsIntoModals() {
    const config = loadUserFirebaseConfig();
    const token = loadAppCheckDebugToken();
    const settings = loadUserSettings();

    this.dom.inputApiKey.value = config.apiKey || "";
    this.dom.inputAuthDomain.value = config.authDomain || "";
    this.dom.inputProjectId.value = config.projectId || "";
    this.dom.inputAppId.value = config.appId || "";
    this.dom.inputAppCheckToken.value = token || "";
    this.dom.selectCloudModel.value = settings.cloudModel || "gemini-2.5-flash-lite";
    this.dom.inputLocalThreshold.value = settings.maxLocalTokensThreshold || 1500;
  }

  saveSettingsFromForm() {
    const newConfig = {
      apiKey: this.dom.inputApiKey.value.trim(),
      authDomain: this.dom.inputAuthDomain.value.trim(),
      projectId: this.dom.inputProjectId.value.trim(),
      appId: this.dom.inputAppId.value.trim()
    };
    saveUserFirebaseConfig(newConfig);

    const newToken = this.dom.inputAppCheckToken.value.trim();
    saveAppCheckDebugToken(newToken);

    const newSettings = {
      cloudModel: this.dom.selectCloudModel.value,
      maxLocalTokensThreshold: parseInt(this.dom.inputLocalThreshold.value, 10) || 1500
    };
    saveUserSettings(newSettings);

    this.dom.modalFirebaseSettings.hide();
    this.showToast("Settings saved! Reloading Firebase AI Logic configuration...");
    setTimeout(() => window.location.reload(), 1000);
  }

  handleAuthStateChange(user) {
    if (user) {
      this.dom.userNameDisplay.innerHTML = `<i class="bi bi-person-check-fill text-success me-1"></i> ${user.displayName || (user.isAnonymous ? 'Guest (On-Device)' : user.email)}`;
      this.dom.btnSignInGoogle.classList.add("d-none");
      this.dom.btnSignOut.classList.remove("d-none");
    } else {
      this.dom.userNameDisplay.innerHTML = `<i class="bi bi-person-dash text-secondary me-1"></i> Offline / Guest`;
      this.dom.btnSignInGoogle.classList.remove("d-none");
      this.dom.btnSignOut.classList.add("d-none");
    }
  }

  async signInGoogle() {
    await this.firebase.executeReCaptcha('LOGIN');
    const res = await this.firebase.signInWithGoogle();
    if (res.success) {
      this.showToast("Signed in with Google account!");
    } else {
      this.showToast(res.error || "Google sign in requires live Firebase config.", "warning");
    }
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  showToast(message, type = "primary") {
    const toastElem = document.getElementById("appToast");
    const toastBody = document.getElementById("toastBody");
    if (!toastElem || !toastBody) return;

    toastBody.innerText = message;
    const toast = new bootstrap.Toast(toastElem, { delay: 3500 });
    toast.show();
  }

  formatMarkdown(text) {
    if (!text) return "";
    let html = text
      // Headings
      .replace(/^### (.*$)/gim, '<h5 class="fw-bold mt-3 mb-2 text-primary">$1</h5>')
      .replace(/^## (.*$)/gim, '<h4 class="fw-bold mt-3 mb-2 text-dark-emphasis">$1</h4>')
      .replace(/^# (.*$)/gim, '<h3 class="fw-bold mt-3 mb-2 text-dark-emphasis">$1</h3>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-start border-3 border-primary ps-3 my-2 text-muted">$1</blockquote>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-dark text-light p-3 rounded my-2"><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-body-secondary px-1 py-0.5 rounded text-danger">$1</code>')
      // Unordered lists
      .replace(/^\s*[-*•]\s+(.*$)/gim, '<li class="mb-1">$1</li>')
      // Linebreaks
      .replace(/\n\n/gim, '<br><br>');

    // Wrap list items in <ul> if matched
    if (html.includes('<li class="mb-1">')) {
      html = html.replace(/(<li class="mb-1">[\s\S]*?<\/li>)/gim, '<ul class="ps-3 my-2">$1</ul>');
    }

    return html;
  }
}

// Instantiate and boot app when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  const app = new OmniScribeApp();
  app.init();
  window.OmniScribe = app; // Expose globally for interactive debugging
});

