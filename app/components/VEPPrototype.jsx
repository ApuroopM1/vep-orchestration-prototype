'use client'

import React, { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   VEP AI+HI ORCHESTRATION SIMULATOR
   A prototype by Appu for Intuit GPM — Virtual Expert Platform
   Job ID: 19602 | Bangalore
   ═══════════════════════════════════════════════════════════════ */

// ── SIMULATED CUSTOMER SCENARIOS ──
const SCENARIOS = [
  {
    id: "s1",
    customer: "Priya Textiles",
    city: "Coimbatore",
    industry: "Textiles & Garments",
    qbPlan: "QuickBooks Online Plus",
    mcStatus: "Not Connected",
    ltv: 284000,
    employees: 50,
    trigger: "Searched 'how to get more customers' in QB Help",
    context: "First-time marketing intent. No Mailchimp account. High-value QB customer dormant 74 days. Never run a campaign.",
    aiConfidence: 0.42,
    routingDecision: "EXPERT_REQUIRED",
    rationale: "AI confidence below threshold (0.42 < 0.60). Customer has zero marketing history — expert onboarding required to set up Mailchimp, configure audience, and launch first campaign. High LTV (₹2.84L) justifies expert cost.",
    expertType: "Marketing Onboarding Specialist",
    expertMatch: { name: "Meera K.", specialization: "SMB Marketing • Textiles", rating: 4.9, sessions: 342, lang: "Tamil, English, Hindi" },
    aiActions: ["Pulled customer's top 20 buyers by revenue from QB", "Pre-built audience segment: 'High-Value Repeat Buyers'", "Generated 3 email template options based on textile industry benchmarks"],
    expectedOutcome: "Mailchimp account setup + first win-back campaign launched in 15-min expert session",
    revenueImpact: "₹47K estimated recovery (1 avg order from dormant customers)",
  },
  {
    id: "s2",
    customer: "MediSupply Plus",
    city: "Mumbai",
    industry: "Healthcare Supplies",
    qbPlan: "QuickBooks Online Advanced",
    mcStatus: "Connected — Standard Plan",
    ltv: 512000,
    employees: 120,
    trigger: "Invoice payment received from dormant B2B client after 90 days",
    context: "Existing Mailchimp user. Has active campaigns. QB detected re-engagement signal. AI can handle autonomously.",
    aiConfidence: 0.91,
    routingDecision: "AI_AUTONOMOUS",
    rationale: "AI confidence high (0.91). Customer has established Mailchimp workflows. QB financial signal (payment received) maps directly to a known automation trigger. No expert needed — auto-trigger 'Welcome Back' sequence.",
    expertType: null,
    expertMatch: null,
    aiActions: ["Detected payment from dormant client (90+ days gap)", "Cross-referenced with MC engagement data — client opened last 2 campaigns", "Auto-triggered 'Re-engaged Client' workflow in Mailchimp", "Logged event to QB Customer Hub timeline"],
    expectedOutcome: "Automated re-engagement sequence triggered within 30 seconds of payment",
    revenueImpact: "₹64K (1 avg order value, 73% conversion rate for re-engaged B2B)",
  },
  {
    id: "s3",
    customer: "StyleVault Boutique",
    city: "Jaipur",
    industry: "Fashion Retail",
    qbPlan: "QuickBooks Online Essentials",
    mcStatus: "Connected — Free Plan",
    ltv: 95000,
    employees: 8,
    trigger: "Revenue dropped 30% MoM in QB dashboard",
    context: "Small retailer with basic Mailchimp. Revenue decline detected by Finance Agent. Needs strategic intervention — AI can diagnose but needs expert for the 'what to do about it' conversation.",
    aiConfidence: 0.67,
    routingDecision: "AI_PLUS_EXPERT",
    rationale: "AI confidence moderate (0.67). AI can diagnose the revenue drop pattern and generate recommendations, but the business context (seasonal? competitor? pricing?) requires human judgment. Route to expert WITH AI-prepared brief.",
    expertType: "Growth Advisor",
    expertMatch: { name: "Aditya R.", specialization: "D2C & Retail Growth • Fashion", rating: 4.8, sessions: 218, lang: "Hindi, English" },
    aiActions: ["Generated revenue trend analysis: -30% MoM, -12% QoQ", "Identified top churned customer segment: 'Occasional Buyers (1-2 orders)'", "Benchmarked against Fashion Retail peers: revenue drop is 2x industry average", "Pre-built 3 campaign strategies: discount win-back, new collection teaser, loyalty program launch"],
    expectedOutcome: "Expert reviews AI analysis, selects strategy with owner, launches campaign in 20-min session",
    revenueImpact: "₹28K estimated recovery over 30 days",
  },
  {
    id: "s4",
    customer: "TechBridge Solutions",
    city: "Pune",
    industry: "IT Services",
    qbPlan: "QuickBooks Online Simple Start",
    mcStatus: "Not Connected",
    ltv: 34000,
    employees: 3,
    trigger: "Created first invoice in QuickBooks",
    context: "Brand new QB customer. Solo founder. Just sent first invoice — perfect moment to introduce marketing but must be non-intrusive. Low LTV doesn't justify live expert yet.",
    aiConfidence: 0.88,
    routingDecision: "AI_SELF_SERVE",
    rationale: "AI confidence high (0.88) for self-serve nudge. New customer with low LTV (₹34K) — expert session not cost-justified yet. Serve contextual AI tip: 'Your first client is in — here's how to get your next 5.' Link to Mailchimp free plan setup wizard.",
    expertType: null,
    expertMatch: null,
    aiActions: ["Detected 'first invoice' milestone event in QB", "Generated contextual nudge: 'Congratulations on your first invoice! Want to find more clients like this?'", "Pre-filled Mailchimp signup with QB business profile", "Queued follow-up nudge for Day 7 if no action taken"],
    expectedOutcome: "Mailchimp free plan activation within 48 hours (target: 22% conversion rate)",
    revenueImpact: "₹720/year Mailchimp subscription (long-term cross-sell seed)",
  },
];

// ── ROUTING LOGIC VISUALIZATION ──
const ROUTING_MODES = {
  AI_AUTONOMOUS: { label: "AI Autonomous", color: "#10b981", icon: "⚡", desc: "High confidence. AI executes without human involvement." },
  AI_SELF_SERVE: { label: "AI Self-Serve", color: "#6366f1", icon: "💡", desc: "AI nudges customer toward self-service action." },
  AI_PLUS_EXPERT: { label: "AI + Expert", color: "#f59e0b", icon: "🤝", desc: "AI prepares brief, expert delivers and adapts." },
  EXPERT_REQUIRED: { label: "Expert Required", color: "#ef4444", icon: "👤", desc: "Low AI confidence. Human expert leads the interaction." },
};

// ── MAIN APP ──
export default function VEPPrototype() {
  const [activeSection, setActiveSection] = useState("problem");
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [simulationStep, setSimulationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const runSimulation = useCallback((scenario) => {
    setSelectedScenario(scenario);
    setSimulationStep(0);
    setIsAnimating(true);
    setActiveSection("simulator");
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSimulationStep(step);
      if (step >= 5) { clearInterval(interval); setIsAnimating(false); }
    }, 900);
  }, []);

  const navItems = [
    { id: "problem", label: "The Problem" },
    { id: "simulator", label: "VEP Simulator" },
    { id: "architecture", label: "Architecture" },
    { id: "metrics", label: "Metrics" },
    { id: "distribution", label: "Getting Hired" },
    { id: "about", label: "About Me" },
  ];

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'SF Pro Display', system-ui, sans-serif", background: "#fafaf9", color: "#1c1917", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(250,250,249,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>VEP Orchestration Prototype</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#a8a29e", fontFamily: "'IBM Plex Mono', monospace", marginLeft: 4 }}>by Appu</span>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setActiveSection(n.id)} style={{
                padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: activeSection === n.id ? "#1c1917" : "transparent",
                color: activeSection === n.id ? "#fafaf9" : "#78716c",
                fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                fontFamily: "inherit",
              }}>{n.label}</button>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px 80px", opacity: mounted ? 1 : 0, transition: "opacity 0.4s" }}>

        {/* ════════ PROBLEM SECTION ════════ */}
        {activeSection === "problem" && (
          <div>
            <div style={{ maxWidth: 720, marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace" }}>THE PROBLEM THIS GPM ROLE EXISTS TO SOLVE</div>
              <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 20px" }}>
                Intuit's AI agents are shipping.<br />
                <span style={{ color: "#dc2626" }}>The AI+HI orchestration layer isn't.</span>
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "#57534e", margin: "0 0 24px" }}>
                Intuit has announced 7 AI agents for QuickBooks — including a Marketing Agent powered by Mailchimp. The product team is building the AI. But who builds the platform that decides <em>when AI should hand off to a human expert, how to prepare the expert with AI-generated context, and how to measure whether the AI+HI outcome was better than AI alone?</em>
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "#57534e", margin: 0 }}>
                That's the Virtual Expert Platform. That's what the GPM role owns. And that orchestration layer is what determines whether Intuit's $2B+ Services business scales — or stalls.
              </p>
            </div>

            {/* Evidence cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
              {[
                { stat: "150bps", label: "Mailchimp drag on GBS growth", detail: "Online Ecosystem grew 25% ex-MC vs 21% with MC in FY25 Q4", color: "#dc2626" },
                { stat: "$2B+", label: "Services revenue (TT Live + QB Live)", detail: "VEP powers every expert-customer connection in this business", color: "#2563eb" },
                { stat: "0", label: "AI+HI marketing advisory sessions", detail: "Marketing Agent is AI-only. No expert routing exists for marketing use cases.", color: "#d97706" },
              ].map((c, i) => (
                <div key={i} style={{ padding: "24px 20px", border: "1px solid #e7e5e4", borderRadius: 12, background: "#fff" }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: c.color, letterSpacing: "-0.02em", fontFamily: "'IBM Plex Mono', monospace" }}>{c.stat}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, marginBottom: 8 }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: "#a8a29e", lineHeight: 1.5 }}>{c.detail}</div>
                </div>
              ))}
            </div>

            {/* The Gap */}
            <div style={{ padding: 28, background: "#1c1917", color: "#fafaf9", borderRadius: 14, marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace" }}>THE GAP</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, lineHeight: 1.4 }}>
                Intuit's Marketing Agent can auto-generate campaigns. But for 63M Indian SMBs who've never run a campaign, AI-only isn't enough.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 0, alignItems: "center" }}>
                <div style={{ padding: 16, background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, marginBottom: 6 }}>WHAT EXISTS</div>
                  <div style={{ fontSize: 13, color: "#d6d3d1", lineHeight: 1.6 }}>AI Marketing Agent (auto-campaigns), Customer Agent (lead management), QB→MC data sync (one-directional), Intuit Assist (GenAI assistant)</div>
                </div>
                <div style={{ textAlign: "center", fontSize: 20, color: "#78716c" }}>→</div>
                <div style={{ padding: 16, background: "rgba(239,68,68,0.1)", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div style={{ fontSize: 12, color: "#fca5a5", fontWeight: 600, marginBottom: 6 }}>WHAT'S MISSING (VEP SCOPE)</div>
                  <div style={{ fontSize: 13, color: "#d6d3d1", lineHeight: 1.6 }}>AI confidence scoring → expert routing, Expert-prepared briefs from AI analysis, AI+HI session orchestration for marketing, Quality measurement: AI-only vs AI+HI outcomes</div>
                </div>
              </div>
            </div>

            <button onClick={() => setActiveSection("simulator")} style={{
              padding: "14px 28px", borderRadius: 10, border: "none", cursor: "pointer",
              background: "#1c1917", color: "#fafaf9", fontSize: 15, fontWeight: 600,
              fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8,
            }}>
              See the VEP Orchestration Simulator →
            </button>
          </div>
        )}

        {/* ════════ SIMULATOR SECTION ════════ */}
        {activeSection === "simulator" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>INTERACTIVE PROTOTYPE</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>VEP Routing Decision Engine</h2>
              <p style={{ fontSize: 15, color: "#78716c", margin: 0 }}>Click any scenario to watch VEP decide: AI-only, AI+Expert, or Expert-required — based on confidence scoring, customer context, and cost-benefit analysis.</p>
            </div>

            {/* Routing Mode Legend */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {Object.entries(ROUTING_MODES).map(([key, m]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, background: m.color + "12", border: `1px solid ${m.color}33` }}>
                  <span>{m.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{m.label}</span>
                </div>
              ))}
            </div>

            {/* Scenario Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 32 }}>
              {SCENARIOS.map(s => {
                const mode = ROUTING_MODES[s.routingDecision];
                return (
                  <button key={s.id} onClick={() => runSimulation(s)} style={{
                    textAlign: "left", padding: 20, borderRadius: 12, cursor: "pointer",
                    border: selectedScenario?.id === s.id ? `2px solid ${mode.color}` : "1px solid #e7e5e4",
                    background: selectedScenario?.id === s.id ? mode.color + "06" : "#fff",
                    fontFamily: "inherit", transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{s.customer}</div>
                        <div style={{ fontSize: 12, color: "#a8a29e" }}>{s.industry} • {s.city}</div>
                      </div>
                      <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: mode.color + "18", color: mode.color }}>
                        {mode.icon} {mode.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "#57534e", lineHeight: 1.5, padding: "8px 10px", background: "#fafaf9", borderRadius: 6, border: "1px solid #f5f5f4" }}>
                      <span style={{ fontWeight: 600, color: "#1c1917" }}>Trigger:</span> {s.trigger}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Simulation Panel */}
            {selectedScenario && (
              <div style={{ border: "1px solid #e7e5e4", borderRadius: 14, background: "#fff", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f5f5f4", background: "#fafaf9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>VEP ROUTING SIMULATION</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedScenario.customer}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#a8a29e" }}>AI Confidence</div>
                      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: selectedScenario.aiConfidence >= 0.8 ? "#16a34a" : selectedScenario.aiConfidence >= 0.6 ? "#d97706" : "#dc2626" }}>
                        {(selectedScenario.aiConfidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: 24 }}>
                  {/* Step-by-step simulation */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { step: 1, label: "Signal Detected", detail: `QuickBooks event: "${selectedScenario.trigger}"`, icon: "📡" },
                      { step: 2, label: "Context Assembled", detail: `${selectedScenario.context}`, icon: "🧠" },
                      { step: 3, label: "Confidence Scored", detail: `AI confidence: ${(selectedScenario.aiConfidence * 100).toFixed(0)}% — ${selectedScenario.aiConfidence >= 0.8 ? "Above threshold (80%). AI can handle." : selectedScenario.aiConfidence >= 0.6 ? "Moderate (60-80%). AI + Expert recommended." : "Below threshold (60%). Expert routing required."}`, icon: "📊" },
                      { step: 4, label: "Routing Decision", detail: selectedScenario.rationale, icon: ROUTING_MODES[selectedScenario.routingDecision].icon },
                      { step: 5, label: "Outcome", detail: `${selectedScenario.expectedOutcome} | Revenue impact: ${selectedScenario.revenueImpact}`, icon: "✅" },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 14, padding: "14px 16px", borderRadius: 10,
                        background: simulationStep >= s.step ? "#f5f5f4" : "transparent",
                        border: simulationStep >= s.step ? "1px solid #e7e5e4" : "1px solid transparent",
                        opacity: simulationStep >= s.step ? 1 : 0.25,
                        transition: "all 0.4s ease",
                        transform: simulationStep >= s.step ? "translateX(0)" : "translateX(-8px)",
                      }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: simulationStep >= s.step ? "#1c1917" : "#e7e5e4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                          {s.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.label}</div>
                          <div style={{ fontSize: 13, color: "#57534e", lineHeight: 1.5 }}>{s.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Pre-work and Expert Match */}
                  {simulationStep >= 5 && (
                    <div style={{ display: "grid", gridTemplateColumns: selectedScenario.expertMatch ? "1fr 1fr" : "1fr", gap: 16, marginTop: 20 }}>
                      <div style={{ padding: 16, background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 8, letterSpacing: "0.05em" }}>AI PRE-WORK (DONE BEFORE EXPERT JOINS)</div>
                        {selectedScenario.aiActions.map((a, i) => (
                          <div key={i} style={{ fontSize: 12, color: "#1e40af", marginBottom: 4, paddingLeft: 12, borderLeft: "2px solid #93c5fd", lineHeight: 1.5 }}>{a}</div>
                        ))}
                      </div>
                      {selectedScenario.expertMatch && (
                        <div style={{ padding: 16, background: "#fef3c7", borderRadius: 10, border: "1px solid #fcd34d" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 8, letterSpacing: "0.05em" }}>VEP EXPERT MATCH</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#78350f" }}>{selectedScenario.expertMatch.name}</div>
                          <div style={{ fontSize: 12, color: "#92400e", marginBottom: 8 }}>{selectedScenario.expertMatch.specialization}</div>
                          <div style={{ fontSize: 12, color: "#a16207" }}>⭐ {selectedScenario.expertMatch.rating} • {selectedScenario.expertMatch.sessions} sessions • {selectedScenario.expertMatch.lang}</div>
                          <div style={{ marginTop: 10, padding: "6px 12px", background: "#fde68a", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#78350f" }}>
                            Expert receives AI-prepared brief before session starts
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════ ARCHITECTURE SECTION ════════ */}
        {activeSection === "architecture" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>PLATFORM ARCHITECTURE</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>VEP Orchestration Layer — What the GPM Builds</h2>
              <p style={{ fontSize: 15, color: "#78716c", margin: 0 }}>The VEP GPM doesn't build the AI agents — those are product team deliverables. The GPM builds the platform layer that makes AI+HI work together.</p>
            </div>

            {/* Architecture blocks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { layer: "TRIGGER LAYER", desc: "Ingests signals from QB agents (Marketing, Customer, Finance) and MC events", components: ["QB Event Bus", "MC Webhook Listener", "Signal Normalizer", "Trigger Registry"], color: "#16a34a" },
                { layer: "CONFIDENCE ENGINE", desc: "Scores AI's ability to handle the interaction autonomously", components: ["Customer History Analyzer", "Use Case Classifier", "Confidence Threshold Config", "Cost-Benefit Calculator"], color: "#2563eb" },
                { layer: "ROUTING DECISION", desc: "Decides: AI-only, AI+Expert, Expert-only, or Self-Serve", components: ["Routing Rules Engine", "Expert Availability Checker", "Queue Manager", "Fallback Logic"], color: "#7c3aed" },
                { layer: "EXPERT PREPARATION", desc: "Assembles AI-generated context brief for the human expert", components: ["Brief Generator", "Customer 360 Assembler", "Recommendation Pre-compute", "Session Context Injector"], color: "#d97706" },
                { layer: "SESSION ORCHESTRATION", desc: "Manages the live AI+HI interaction", components: ["Real-time AI Assist (co-pilot for expert)", "Action Executor (triggers MC campaigns)", "Session Recorder", "Handoff Manager"], color: "#dc2626" },
                { layer: "OBSERVABILITY", desc: "Measures outcomes and feeds back into confidence scoring", components: ["Outcome Tracker", "AI vs AI+HI A/B Framework", "Expert Quality Scoring", "Revenue Attribution"], color: "#0891b2" },
              ].map((l, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 1fr", border: "1px solid #e7e5e4", borderRadius: i === 0 ? "12px 12px 0 0" : i === 5 ? "0 0 12px 12px" : 0, overflow: "hidden" }}>
                  <div style={{ padding: "16px 16px", background: l.color, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", opacity: 0.8 }}>LAYER {i + 1}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{l.layer}</div>
                  </div>
                  <div style={{ padding: "14px 20px", background: "#fff" }}>
                    <div style={{ fontSize: 13, color: "#57534e", marginBottom: 8 }}>{l.desc}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {l.components.map((c, j) => (
                        <span key={j} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: l.color + "10", color: l.color, border: `1px solid ${l.color}25` }}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════ METRICS SECTION ════════ */}
        {activeSection === "metrics" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>SUCCESS FRAMEWORK</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>How I'd Measure VEP Success — Day 1 Metrics Framework</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {[
                { category: "Platform Health", metrics: [
                  { name: "Routing Accuracy", target: ">90%", desc: "% of routing decisions that didn't require manual override" },
                  { name: "Expert Prep Time Saved", target: "60%↓", desc: "Time expert spends understanding context (AI brief vs no brief)" },
                  { name: "Session Start Latency", target: "<45s", desc: "Time from trigger to expert connection (for routed sessions)" },
                ]},
                { category: "Customer Outcomes", metrics: [
                  { name: "Cross-sell Attach Rate", target: "QB→MC 15%", desc: "% of QB customers who activate Mailchimp via VEP" },
                  { name: "First Campaign Launch Rate", target: "40%", desc: "% of new MC users who send their first campaign within 7 days" },
                  { name: "CSAT: AI+HI vs AI-only", target: "+20pts", desc: "NPS delta between expert-assisted and AI-only marketing sessions" },
                ]},
                { category: "Business Impact", metrics: [
                  { name: "Revenue per VEP Session", target: "₹2,400", desc: "Avg incremental revenue generated per expert-assisted session" },
                  { name: "Expert Utilization", target: ">75%", desc: "% of expert time spent in sessions vs idle/admin" },
                  { name: "Cost per Acquisition", target: "₹180", desc: "Cost of VEP-driven MC activation vs organic" },
                ]},
                { category: "Learning Loop", metrics: [
                  { name: "AI Confidence Calibration", target: "±5%", desc: "Gap between predicted and actual success rate per confidence band" },
                  { name: "Automation Rate", target: "70%→85%", desc: "% of interactions handled AI-only (should increase over time)" },
                  { name: "Expert Feedback Loop", target: "100%", desc: "% of sessions where expert rates AI pre-work quality" },
                ]},
              ].map((cat, i) => (
                <div key={i} style={{ border: "1px solid #e7e5e4", borderRadius: 12, background: "#fff", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", background: "#1c1917", color: "#fafaf9" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{cat.category}</div>
                  </div>
                  {cat.metrics.map((m, j) => (
                    <div key={j} style={{ padding: "12px 18px", borderBottom: j < 2 ? "1px solid #f5f5f4" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: "#16a34a" }}>{m.target}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#a8a29e" }}>{m.desc}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════ DISTRIBUTION SECTION ════════ */}
        {activeSection === "distribution" && (
          <div style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>DISTRIBUTION STRATEGY</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>How This Prototype Gets in Front of the Right People</h2>
              <p style={{ fontSize: 15, color: "#78716c", margin: 0 }}>LinkedIn DMs to senior leaders get ignored. Here's the actual playbook.</p>
            </div>

            {[
              { n: "01", title: "Employee Referral (Highest Conversion)", detail: "Intuit India has 2,500+ employees in Bangalore. The target is finding ONE person in the VEP or QuickBooks Live org who can refer. Approach: search LinkedIn for 'Intuit Bangalore Product Manager' or 'Intuit VEP', identify Staff/Senior PMs, engage with their content for 1-2 weeks, then send a personalized note with this prototype link. Employee referrals at Intuit skip the recruiter screen.", urgent: true },
              { n: "02", title: "Intuit India Product Community Events", detail: "Intuit India hosts TechCon, Global Engineering Days, and product community meetups. Attend any open events. The Bangalore PM community is tight-knit. Even virtual events listed on the Intuit India LinkedIn page are entry points. Ask intelligent questions about VEP during Q&A.", urgent: true },
              { n: "03", title: "Naukri + Formal Application (Parallel Track)", detail: "Apply formally through jobs.intuit.com (Job ID: 19602) AND Naukri (54 Intuit jobs currently listed). Include the prototype URL in the 'additional links' field. This ensures you're in the ATS when the referral or bypass route hits.", urgent: true },
              { n: "04", title: "LinkedIn Long-Form Article (Not a Post)", detail: "Write ONE deep article (not a post): 'Why Intuit's AI Agents Need an Orchestration Layer — A Product Strategy Analysis.' Embed this prototype. Tag Intuit India, Saurabh Saxena, and relevant PMs. Articles have 10x the shelf life of posts and show up in Google search.", urgent: false },
              { n: "05", title: "Direct Email to Recruiting", detail: "Email TalentAcquisition@intuit.com (listed on their careers page) with subject: 'GPM VEP Role (19602) — Built a working prototype of the AI+HI orchestration layer.' Attach CV. Link to this prototype. Recruiters see hundreds of applications. One with a live prototype stands out.", urgent: false },
              { n: "06", title: "Intuit India Glassdoor / Community", detail: "The Intuit India hiring process averages 23 days. Glassdoor shows GPM roles require a 'Craft Presentation.' This prototype IS your craft presentation — pre-built, demonstrating the exact thinking the role requires.", urgent: false },
            ].map((s, i) => (
              <div key={i} style={{
                display: "flex", gap: 16, padding: "20px 0",
                borderBottom: i < 5 ? "1px solid #f5f5f4" : "none",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: s.urgent ? "#1c1917" : "#f5f5f4",
                  color: s.urgent ? "#fafaf9" : "#78716c",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace",
                }}>{s.n}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{s.title}</div>
                    {s.urgent && <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#fef2f2", color: "#dc2626" }}>DO THIS WEEK</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "#57534e", lineHeight: 1.6 }}>{s.detail}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 32, padding: 20, background: "#fef3c7", borderRadius: 12, border: "1px solid #fcd34d" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#78350f", marginBottom: 6 }}>The core insight on distribution</div>
              <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
                You don't need Saurabh Saxena to reply to your LinkedIn DM. You need ONE Intuit PM — at any level — to see this prototype, think "this person gets it," and forward it internally with a referral. In Intuit's culture, internal referrals carry enormous weight. Your job is to make this prototype easy to share and impossible to ignore.
              </div>
            </div>
          </div>
        )}

        {/* ════════ ABOUT SECTION ════════ */}
        {activeSection === "about" && (
          <div style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>ABOUT THE BUILDER</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Why I Built This — And Why I'm the Right GPM for VEP</h2>
            </div>

            <div style={{ padding: 24, background: "#fff", border: "1px solid #e7e5e4", borderRadius: 14, marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Appu</div>
              <div style={{ fontSize: 14, color: "#57534e", lineHeight: 1.8, marginBottom: 20 }}>
                16+ years in enterprise product management across BFSI, Telecom, Healthcare, and HCM. I build platforms, not features. My career anchor is a Verizon project where I consolidated 14 legacy systems into one unified cloud-native platform — leading a 15-person PM/UX/Ops organization, delivering significant OPEX savings and NPS improvement. That experience is structurally identical to what VEP needs: taking multiple disconnected systems (AI agents, expert networks, scheduling, routing) and building the orchestration layer that makes them work as one platform.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "What the JD asks", proof: "My proof point" },
                  { label: "8+ years PM with people leadership", proof: "16 years. Led 15-person cross-functional org at Verizon." },
                  { label: "Platform/marketplace/AI experience", proof: "Built unified platform (Verizon). Designed AI evaluation frameworks. Built 0→1 AI products as founder." },
                  { label: "Thrives in ambiguity", proof: "Arrived at Verizon to 14 disconnected systems. No roadmap. Built vision stakeholder-by-stakeholder." },
                  { label: "Technical fluency in AI systems", proof: "Deep in LLM evals (RAGAS, BERTScore). Built with Claude API, Next.js, Supabase. Designed API-first architectures." },
                  { label: "Site leadership (IDC)", proof: "Based in India. 16 years building and leading teams in Indian enterprise context." },
                  { label: "Cross-functional alignment", proof: "Built compliance narratives (OpenText), investor pitches, GTM strategies across legal, eng, product." },
                ].map((row, i) => i === 0 ? (
                  <React.Fragment key={i}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#a8a29e", padding: "8px 0" }}>{row.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#a8a29e", padding: "8px 0" }}>{row.proof}</div>
                  </React.Fragment>
                ) : (
                  <React.Fragment key={i}>
                    <div style={{ fontSize: 13, color: "#78716c", padding: "10px 0", borderTop: "1px solid #f5f5f4" }}>{row.label}</div>
                    <div style={{ fontSize: 13, color: "#1c1917", fontWeight: 500, padding: "10px 0", borderTop: "1px solid #f5f5f4" }}>{row.proof}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div style={{ padding: 24, background: "#1c1917", color: "#fafaf9", borderRadius: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Why I built this instead of just applying</div>
              <div style={{ fontSize: 14, color: "#d6d3d1", lineHeight: 1.8 }}>
                Because the GPM VEP role is about taking open-ended, cross-cutting problems and translating them into clear product vision and executable plans. That's literally what this prototype does. I didn't wait for an interview prompt. I read the JD, studied Intuit's public earnings, mapped the gap between what's been announced (AI agents) and what hasn't been built (AI+HI orchestration), and built a working demonstration of the platform thinking this role requires.
              </div>
              <div style={{ fontSize: 14, color: "#d6d3d1", lineHeight: 1.8, marginTop: 12 }}>
                If this is how I approach a job application, imagine what I'd build with actual access to VEP's codebase, customer data, and engineering team.
              </div>
              <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#a8a29e", fontFamily: "'IBM Plex Mono', monospace" }}>
                Job ID: 19602 | Group Product Manager, Virtual Expert Platform | Bangalore
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
