/**
 * OmniScribe Hybrid AI - Chrome Built-in AI & Gemini Nano Hardware Probe
 * Checks availability of on-device model APIs (Prompt API / Gemini Nano) and system capabilities.
 */

export class NanoDetector {
  constructor() {
    this.status = "checking"; // "ready", "after-download", "unsupported", "simulated"
    this.capabilities = null;
    this.details = {
      browser: this.detectBrowser(),
      hasPromptAPI: false,
      hasWebGPU: false,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      deviceMemory: navigator.deviceMemory || "N/A",
      platform: navigator.platform || "Desktop",
      temperatureRange: null,
      topK: null,
      maxTokens: null,
      statusMessage: "Checking local Gemini Nano availability..."
    };
  }

  detectBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Edg/")) return "Microsoft Edge";
    if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/")) return "Google Chrome";
    if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) return "Apple Safari";
    if (userAgent.includes("Firefox/")) return "Mozilla Firefox";
    return "Web Browser";
  }

  async probeCapabilities() {
    // 1. Check WebGPU
    try {
      if (navigator.gpu) {
        const adapter = await navigator.gpu.requestAdapter();
        this.details.hasWebGPU = !!adapter;
      }
    } catch (e) {
      this.details.hasWebGPU = false;
    }

    // 2. Check Chrome Built-in AI (Prompt API / Gemini Nano)
    // Supports various specifications (ai.languageModel, window.ai.languageModel, window.model)
    try {
      const aiObject = window.ai || (typeof ai !== "undefined" ? ai : null);

      if (aiObject && aiObject.languageModel) {
        this.details.hasPromptAPI = true;
        let availabilityResult = null;

        // Try capabilities() or availability()
        if (typeof aiObject.languageModel.capabilities === "function") {
          this.capabilities = await aiObject.languageModel.capabilities();
          availabilityResult = this.capabilities.available;
          this.details.temperatureRange = {
            default: this.capabilities.defaultTemperature,
            max: this.capabilities.maxTemperature
          };
          this.details.topK = this.capabilities.defaultTopK;
          this.details.maxTokens = this.capabilities.maxTokens;
        } else if (typeof aiObject.languageModel.availability === "function") {
          availabilityResult = await aiObject.languageModel.availability();
        }

        if (availabilityResult === "readily" || availabilityResult === "ready") {
          this.status = "ready";
          this.details.statusMessage = "Gemini Nano is downloaded and ready for on-device inference.";
        } else if (availabilityResult === "after-download") {
          this.status = "after-download";
          this.details.statusMessage = "Gemini Nano is supported, but model weights need to download in Chrome.";
        } else {
          this.status = "unsupported";
          this.details.statusMessage = "Chrome Prompt API detected, but Gemini Nano is not currently enabled.";
        }
      } else {
        this.details.hasPromptAPI = false;
        this.status = "unsupported";
        this.details.statusMessage = "Chrome Built-in AI (Gemini Nano) not detected. Hybrid fallback will use cloud or high-performance edge simulation.";
      }
    } catch (err) {
      console.warn("Error probing Prompt API:", err);
      this.status = "unsupported";
      this.details.statusMessage = `Prompt API probe error: ${err.message}`;
    }

    return {
      status: this.status,
      details: this.details,
      capabilities: this.capabilities
    };
  }

  /**
   * Run an on-device prompt using Chrome's native Prompt API if available,
   * with high-speed local processing.
   */
  async runNativePrompt(promptText, systemPrompt = "You are OmniScribe Hybrid AI running on-device.") {
    const aiObject = window.ai || (typeof ai !== "undefined" ? ai : null);
    if (!aiObject || !aiObject.languageModel) {
      throw new Error("Native Prompt API not available in this browser environment.");
    }

    const session = await aiObject.languageModel.create({
      systemPrompt: systemPrompt
    });

    const startTime = performance.now();
    const result = await session.prompt(promptText);
    const latency = Math.round(performance.now() - startTime);

    // Destroy session after use to free VRAM/RAM
    if (session.destroy) {
      session.destroy();
    }

    return {
      text: result,
      latency,
      source: "on-device-native",
      model: "Gemini Nano (Chrome Built-in AI)",
      tokens: Math.round((promptText.length + result.length) / 4)
    };
  }
}
