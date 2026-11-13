/**
 * OmniScribe Hybrid AI - Pre-loaded Realistic Sample Scenarios
 * For Hackathon Demonstration & Instant Evaluation
 */

export const SAMPLE_SCENARIOS = {
  clinical: {
    id: "clinical",
    title: "Patient Consultation & Clinical Assessment",
    category: "Medical & Health",
    privacyScore: 100,
    recommendedMode: "local",
    reason: "Contains Protected Health Information (PHI) & PII. On-device processing guarantees 100% HIPAA/GDPR zero-data-egress compliance.",
    content: `PATIENT CLINICAL ENCOUNTER NOTE
Date: November 12, 2026 | Clinic: Metro Urgent Care Center
Patient Name: Eleanor Vance | DOB: 04/18/1984 | MRN: 948201-B
Attending Physician: Dr. Marcus Reynolds, MD (NPI: 1049283719)

CHIEF COMPLAINT:
Severe intermittent migraine headache for 4 days with photophobia and nausea.

HISTORY OF PRESENT ILLNESS:
Patient is a 42-year-old female presenting with escalating throbbing unilateral temporal headache (left-sided, pain score 8/10). Onset coincided with prolonged screen work. Reports aura with visual scintillating scotoma 30 minutes prior to headache onset. Nausea present without vomiting. Over-the-counter ibuprofen 400mg provided minimal relief.

PAST MEDICAL HISTORY:
- History of episodic tension headaches since age 28
- Mild hypertension managed on Lisinopril 10mg daily
- No history of seizures or intracranial pathology

CURRENT MEDICATIONS:
- Lisinopril 10mg PO daily
- Multivitamin oral tab daily

PHYSICAL EXAMINATION:
- BP: 128/82 mmHg | HR: 74 bpm | Temp: 98.4°F | SpO2: 99% on room air
- HEENT: Normocephalic, atraumatic. Pupils equal, round, and reactive to light. Extraocular movements intact without nystagmus.
- Neurological: Alert and oriented x4. Cranial nerves II-XII grossly intact. Motor strength 5/5 bilaterally. Sensation intact to light touch. Normal gait.

ASSESSMENT:
1. Acute exacerbation of migraine with visual aura (G43.109).
2. Essential hypertension, well-controlled (I10).

PLAN:
1. Administer Sumatriptan 50mg PO now; prescription provided for Sumatriptan 50mg PO PRN onset of aura (max 100mg/24h).
2. Recommend headache journal tracking dietary triggers and sleep patterns.
3. Follow-up in 3 weeks or urgent return if symptoms worsen, or if neurological deficits emerge.`
  },

  board_meeting: {
    id: "board_meeting",
    title: "Project Titan Executive Board Minutes (Confidential)",
    category: "Corporate & Legal",
    privacyScore: 95,
    recommendedMode: "hybrid",
    reason: "Internal strategic restructuring and unannounced acquisition pricing. Quick tasks run locally; deep cross-analysis can optionally use cloud boost.",
    content: `CONFIDENTIAL - STRICTLY FOR BOARD OF DIRECTORS ONLY
Meeting Date: November 10, 2026 | Location: San Francisco Executive Suite / Hybrid
Chair: Sarah Sterling (CEO) | Present: Michael Chang (CFO), Priya Sharma (CTO), Arthur Pendelton (Board Member), Elena Rostova (Chief Legal Counsel)

AGENDA:
1. Q3 Fiscal Performance & Revenue Realization
2. Acquisition of NeuroCore Robotics (Project Titan)
3. Budget Reallocation for On-Device Edge-AI Infrastructure
4. Executive Compensation Committee Recommendations

KEY DISCUSSION POINTS & DECISIONS:
- CFO Michael Chang presented Q3 ARR reaching $48.2M, beating expectations by 14%. Cloud inference infrastructure costs, however, escalated 34% quarter-over-quarter due to high LLM API token consumption in user-facing search features.
- CTO Priya Sharma advocated strongly for transitioning user queries to client-side hybrid models (Firebase AI Logic with Gemini Nano) to eliminate $1.8M in annual recurring cloud GPU server costs while delivering sub-50ms latency.
- Board unanimously approved allocating $3.5M towards the immediate acquisition of NeuroCore Robotics IP assets, pending final due diligence clearance from Chief Legal Counsel Elena Rostova by December 5, 2026.
- All non-disclosure agreements (NDAs) remain active under code-name "Titan". No public disclosures or SEC 8-K filings until terms are countersigned.

ACTION ITEMS:
1. Elena Rostova: Finalize IP asset purchase agreement and escrow covenants by Nov 28.
2. Priya Sharma: Deploy Firebase AI Logic hybrid inference prototype to enterprise beta ring by Nov 20 to benchmark token cost savings.
3. Michael Chang: Present updated 2027 fiscal model reflecting on-device inference savings at the next December board meeting.
4. Sarah Sterling: Schedule one-on-one alignment call with NeuroCore founder before Nov 18.`
  },

  financial_audit: {
    id: "financial_audit",
    title: "Q4 Hardware & Cloud Compute Expense Ledger",
    category: "Finance & Accounting",
    privacyScore: 90,
    recommendedMode: "hybrid",
    reason: "Financial numbers, bank routing codes, and vendor billing data.",
    content: `FINANCIAL AUDIT & EXPENDITURE SUMMARY
Organization: NextGen Autonomous Systems Inc.
Reporting Period: October 1 - October 31, 2026
Prepared by: Jonathan Hayes, Senior Financial Controller

EXPENSE BREAKDOWN TABLE:
- Vendor A (Hyperscaler Cloud Compute): $38,420.00 | Account Code: EXP-7014 (GPU Cluster Inference)
- Vendor B (API Token Gateway): $14,290.50 | Account Code: EXP-7021 (Public Cloud LLM Queries)
- Vendor C (Edge Device DevKits & NPUs): $8,750.00 | Account Code: CAP-3091 (On-Device Test Rigs)
- Vendor D (App Check & Security Auditing): $2,100.00 | Account Code: EXP-6045 (Firebase Security Infrastructure)
- Total Monthly Compute & Model Expenditure: $63,560.50

AUDIT FINDINGS:
1. Cloud LLM query costs rose from $4,100 in January to $14,290 in October, primarily driven by unoptimized micro-prompts (e.g., spelling checks, 1-line categorizations) processed on expensive cloud endpoints.
2. Estimated savings from switching micro-prompts to on-device Gemini Nano inference: 68% ($9,700/month reduction).
3. Recommended policy: Enforce on-device processing for all payloads under 1,000 tokens using Firebase AI Logic InferenceMode.PREFER_ON_DEVICE.`
  },

  technical_rfc: {
    id: "technical_rfc",
    title: "RFC-204: Hybrid On-Device & Cloud AI Architecture",
    category: "Engineering Architecture",
    privacyScore: 85,
    recommendedMode: "cloud",
    reason: "Large technical specification requiring deep multimodal architecture synthesis and multi-step reasoning.",
    content: `REQUEST FOR COMMENTS: RFC-204
Title: Unified Hybrid Client-Edge Inference Architecture
Author: Cloud Architecture Core Team
Status: Draft | Target Release: Firebase AI Logic 2026

1. SUMMARY
This document proposes a unified hybrid execution pipeline that leverages client-side neural processing units (NPUs) and Gemini Nano in Chrome alongside Firebase AI Logic cloud endpoints.

2. MOTIVATION
Traditional cloud-only generative AI architectures suffer from three critical bottlenecks:
a. High network round-trip latency (typically 300ms - 1,200ms depending on geographical distance).
b. Prohibitive token costs at scale for real-time keystroke interactions.
c. User data leaves the client device, raising regulatory hurdles in healthcare and finance.

3. ARCHITECTURAL TOPOLOGY
- Layer 1 (Client / Hardware): Web (Chrome Prompt API / Gemini Nano) and Native (AICore / Apple Foundation Models).
- Layer 2 (Orchestration): Firebase AI Logic SDK with InferenceMode.PREFER_ON_DEVICE.
- Layer 3 (Security & Trust): Firebase App Check ensures unauthorized clients cannot query cloud fallback endpoints.
- Layer 4 (Remote Governance): Firebase Remote Config dynamically switches fallback thresholds and target models without client re-deployment.
- Layer 5 (State Persistence): Cloud Firestore stores sanitized metadata, sync records, and benchmark telemetry.`
  }
};

