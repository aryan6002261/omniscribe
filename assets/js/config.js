/**
 * OmniScribe Hybrid AI - Configuration & Environment Defaults
 */

export const DEFAULT_CONFIG = {
  // Demo/Placeholder configuration. Users can supply their real keys via the in-app Settings modal
  firebase: {
    apiKey: "AIzaSyDEMO-HYBRID-AI-HACKATHON-KEY",
    authDomain: "hybrid-ai-logic-demo.firebaseapp.com",
    projectId: "hybrid-ai-logic-demo",
    storageBucket: "hybrid-ai-logic-demo.firebasestorage.app",
    messagingSenderId: "109876543210",
    appId: "1:109876543210:web:abcdef1234567890",
    measurementId: "G-DEMO123456"
  },

  appCheck: {
    debugToken: "DEMO-DEBUG-TOKEN-FIREBASE-AI-LOGIC-2026",
    useDebugToken: true,
    reCaptchaEnterpriseSiteKey: ""
  },

  ai: {
    cloudModel: "gemini-2.5-flash-lite", // Recommended default model
    fallbackCloudModel: "gemini-flash-latest",
    localModelName: "Gemini Nano 4 (On-Device)",
    defaultMode: "auto", // "auto" (PREFER_ON_DEVICE), "local_only", "cloud_only"
    maxLocalTokensThreshold: 1500, // Payloads over this threshold are routed to cloud in Auto mode
    temperature: 0.7,
    maxOutputTokens: 2048,
    streamResponses: true
  },

  remoteConfigDefaults: {
    feature_hybrid_redaction_enabled: true,
    feature_multimodal_analysis_enabled: true,
    recommended_cloud_model: "gemini-2.5-flash-lite",
    strict_pii_local_enforcement: true,
    cost_per_million_cloud_tokens_usd: 0.10, // Gemini Flash pricing benchmark
    cost_per_on_device_token_usd: 0.00
  }
};

const STORAGE_KEY_FIREBASE = "omniscribe_firebase_config";
const STORAGE_KEY_APPCHECK = "omniscribe_appcheck_token";
const STORAGE_KEY_SETTINGS = "omniscribe_user_settings";

export function loadUserFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG.firebase, ...parsed };
    }
  } catch (e) {
    console.warn("Failed to load saved Firebase config", e);
  }
  return { ...DEFAULT_CONFIG.firebase };
}

export function saveUserFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error("Failed to save Firebase config", e);
    return false;
  }
}

export function loadAppCheckDebugToken() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_APPCHECK);
    if (saved) return saved;
  } catch (e) {}
  return DEFAULT_CONFIG.appCheck.debugToken;
}

export function saveAppCheckDebugToken(token) {
  try {
    localStorage.setItem(STORAGE_KEY_APPCHECK, token);
    return true;
  } catch (e) {
    return false;
  }
}

export function loadUserSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      return { ...DEFAULT_CONFIG.ai, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return { ...DEFAULT_CONFIG.ai };
}

export function saveUserSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    return true;
  } catch (e) {
    return false;
  }
}

