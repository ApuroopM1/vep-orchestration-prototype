'use client'

import React, { useState, useEffect, useCallback } from "react";

const SCENARIOS = [
  {
    id: "s1", product: "TurboTax Live", customer: "Neha Sharma", city: "Pune",
    persona: "Salaried professional, first-time investor",
    trigger: "Entered capital gains from equity MF redemption — paused 90 seconds on Schedule CG",
    context: "First time filing with capital gains. TurboTax detected hesitation (3 back-navigations on Schedule CG). Has salary income + one MF redemption of Rs 4.2L. Standard deductions already applied. Prior year filed as simple ITR-1.",
    aiConfidence: 0.38, routingDecision: "EXPERT_REQUIRED",
    rationale: "AI confidence below threshold (0.38 < 0.60). Customer hesitation pattern signals confusion, not just slowness. Capital gains filing is error-prone for first-timers — wrong ITR form selection (ITR-2 vs ITR-1) is the #1 error. High risk of incorrect filing justifies expert cost. TurboTax Live ARPR uplift: Rs 2,400.",
    expertType: "Tax Expert — Capital Gains Specialist",
    expertMatch: { name: "CA Raghav M.", specialization: "Capital Gains & Investment Tax", rating: 4.9, sessions: 612, lang: "Hindi, English, Marathi" },
    aiActions: ["Detected hesitation pattern: 3 back-navigations on Schedule CG in 90 seconds", "Pre-computed capital gains: Rs 4.2L redemption, Rs 3.1L cost basis, Rs 1.1L LTCG", "Pre-filled ITR-2 form with salary + CG data from connected sources", "Generated summary brief: First-time CG filer. Likely confused about ITR form selection and indexation benefit."],
    expectedOutcome: "Expert confirms ITR-2 selection, explains indexation, reviews and files in 12-min session",
    revenueImpact: "Rs 2,400 TT Live session fee + 78% retention probability for next tax season",
  },
  {
    id: "s2", product: "QuickBooks Live", customer: "Freshbite Cafe", city: "Bangalore",
    persona: "Restaurant owner, 12 employees, using QB Payroll",
    trigger: "GST filing deadline in 3 days — 23 unreconciled transactions flagged by Accounting Agent",
    context: "Regular QB Live customer. Has a dedicated bookkeeper. Accounting Agent flagged 23 transactions that could not be auto-categorized (mixed personal/business expenses on same card). Bookkeeper can resolve but needs to be scheduled urgently given GST deadline.",
    aiConfidence: 0.85, routingDecision: "AI_PLUS_EXPERT",
    rationale: "AI confidence moderate-high (0.85) for categorization but GST deadline creates urgency that requires expert judgment. AI can pre-categorize 18/23 transactions with 90%+ confidence. Remaining 5 need human decision (personal vs business split). Route to assigned bookkeeper WITH pre-categorized brief.",
    expertType: "Bookkeeper — GST Compliance",
    expertMatch: { name: "Priya L.", specialization: "F&B Bookkeeping & GST", rating: 4.8, sessions: 891, lang: "Kannada, English, Hindi" },
    aiActions: ["Pre-categorized 18 of 23 flagged transactions (90%+ confidence)", "Identified 5 transactions needing human judgment — mixed-use card expenses", "Generated GST summary: Input tax credit eligible Rs 34,200, liability Rs 1,12,400", "Scheduled priority slot with assigned bookkeeper Priya L. (available in 8 min)", "Pre-loaded transaction review screen with AI recommendations highlighted"],
    expectedOutcome: "Bookkeeper confirms AI categories, resolves 5 ambiguous items, GST filed within 20-min session",
    revenueImpact: "Rs 0 incremental (existing QB Live subscriber) but prevents churn — missed GST deadline = #1 reason for QB Live cancellation",
  },
  {
    id: "s3", product: "QuickBooks — Payments Agent", customer: "BuildRight Contractors", city: "Delhi",
    persona: "Construction firm, 85 employees, Rs 3.7L avg invoice",
    trigger: "Payments Agent detected: 3 invoices totaling Rs 11.2L overdue by 45+ days from same client",
    context: "High-value B2B customer with concentrated receivables risk. Payments Agent has already sent 2 automated reminders with no response. The pattern suggests a potential bad debt situation. AI can escalate the reminder cadence but the business decision (whether to pause new work, offer a payment plan, or escalate to legal) requires human judgment.",
    aiConfidence: 0.52, routingDecision: "EXPERT_REQUIRED",
    rationale: "AI confidence low (0.52). Three automated reminders failed. The decision tree branches into legal, relationship, and cash flow implications that AI cannot safely navigate. Rs 11.2L represents 18% of monthly revenue — material impact. Route to financial advisor with full AR aging report.",
    expertType: "Financial Advisor — Cash Flow & Collections",
    expertMatch: { name: "Amit S.", specialization: "Construction Finance & AR Management", rating: 4.7, sessions: 234, lang: "Hindi, English" },
    aiActions: ["Generated AR aging report: Rs 11.2L overdue (45+ days), client payment history shows 2 prior late payments (resolved at 30 days)", "Cash flow impact analysis: If unpaid, runway reduces from 4.2 months to 3.1 months", "Pre-drafted 3 options: (1) Formal demand notice, (2) Payment plan offer (3 instalments), (3) Pause new work orders", "Pulled client QB payment history: 14 invoices paid on time in last 12 months before this block"],
    expectedOutcome: "Expert reviews situation, recommends payment plan approach given client prior good history, drafts outreach with owner",
    revenueImpact: "Rs 11.2L AR recovery. Secondary: prevents Rs 3.7L in new work exposure.",
  },
  {
    id: "s4", product: "TurboTax — Self-Serve", customer: "Arjun Patel", city: "Ahmedabad",
    persona: "Salaried employee, single income, standard deductions",
    trigger: "Started ITR-1 filing, entered Form 16 data, reached final review",
    context: "Simple return. Single employer, no capital gains, no house property income, standard 80C/80D deductions already pre-filled from Form 16. Intuit Assist has verified all entries against Form 16 data. No anomalies detected.",
    aiConfidence: 0.96, routingDecision: "AI_AUTONOMOUS",
    rationale: "AI confidence very high (0.96). Simple ITR-1 with all data cross-verified against Form 16. No anomalies, no complex deductions, no capital gains. AI can complete the filing autonomously. Surfacing an expert here would add cost with no customer benefit — and slow down a user who wants speed.",
    expertType: null, expertMatch: null,
    aiActions: ["Cross-verified all Form 16 entries — 100% match", "Applied standard deduction Rs 50,000 + 80C Rs 1.5L + 80D Rs 25,000", "Computed tax liability: Rs 12,400 (old regime) vs Rs 8,200 (new regime)", "Auto-selected new regime (Rs 4,200 savings), displayed comparison to user", "Generated filing-ready ITR-1 — user can submit with one click"],
    expectedOutcome: "User files in under 5 minutes. No expert needed. CSAT target: 4.5+",
    revenueImpact: "Rs 0 (free tier user) — but drives platform adoption and potential upsell to TT Live next year if situation gets complex",
  },
];

const ROUTING_MODES = {
  AI_AUTONOMOUS: { label: "AI Autonomous", color: "#10b981", icon: "\u26A1", desc: "High confidence. AI executes without human involvement." },
  AI_SELF_SERVE: { label: "AI Self-Serve", color: "#6366f1", icon: "\uD83D\uDCA1", desc: "AI nudges customer toward self-service action." },
  AI_PLUS_EXPERT: { label: "AI + Expert", color: "#f59e0b", icon: "\uD83E\uDD1D", desc: "AI prepares context brief. Expert delivers and adapts." },
  EXPERT_REQUIRED: { label: "Expert Required", color: "#ef4444", icon: "\uD83D\uDC64", desc: "Low AI confidence or high stakes. Human expert leads." },
};

export default function VEPPrototype() {
  const [activeSection, setActiveSection] = useState("problem");
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [simulationStep, setSimulationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const runSimulation = useCallback((scenario) => {
    setSelectedScenario(scenario); setSimulationStep(0); setIsAnimating(true); setActiveSection("simulator");
    let step = 0;
    const interval = setInterval(() => { step++; setSimulationStep(step); if (step >= 5) { clearInterval(interval); setIsAnimating(false); } }, 900);
  }, []);
  const navItems = [
    { id: "problem", label: "The Challenge" },
    { id: "simulator", label: "Routing Simulator" },
    { id: "architecture", label: "Platform Architecture" },
    { id: "metrics", label: "Success Metrics" },
  ];

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'SF Pro Display', system-ui, sans-serif", background: "#fafaf9", color: "#1c1917", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(250,250,249,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid #e7e5e4" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>VEP Orchestration Simulator</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#a8a29e", fontFamily: "'IBM Plex Mono', monospace", marginLeft: 4 }}>Virtual Expert Platform</span>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setActiveSection(n.id)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: activeSection === n.id ? "#1c1917" : "transparent", color: activeSection === n.id ? "#fafaf9" : "#78716c", fontSize: 12, fontWeight: 600, transition: "all 0.15s", fontFamily: "inherit" }}>{n.label}</button>
            ))}
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px 80px", opacity: mounted ? 1 : 0, transition: "opacity 0.4s" }}>
        {activeSection === "problem" && (
          <div>
            <div style={{ maxWidth: 720, marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace" }}>THE PLATFORM CHALLENGE</div>
              <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 20px" }}>VEP powers a $2B+ Services business today.<br /><span style={{ color: "#2563eb" }}>7 new AI agents are about to change what it needs to do.</span></h1>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "#57534e", margin: "0 0 24px" }}>Intuit's Virtual Expert Platform connects 100M+ customers to 12,000+ tax and bookkeeping experts through TurboTax Live and QuickBooks Live. It already handles expert discovery, routing, scheduling, engagement, conversations, and observability.</p>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "#57534e", margin: 0 }}>Now, with AI agents launching across Marketing, Payments, Accounting, Finance, Payroll, and Project Management — VEP must evolve from a <em>tax-and-bookkeeping expert platform</em> to the <em>universal orchestration layer</em> that decides when AI handles it alone, when AI prepares context for a human expert, and when a human expert needs to lead entirely.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
              {[
                { stat: "$2B+", label: "Services revenue (TT Live + QB Live)", detail: "VEP powers every expert-customer connection in this multi-billion dollar business", color: "#2563eb" },
                { stat: "12,000+", label: "AI-enabled human experts", detail: "Tax preparers and bookkeepers connected through VEP. 78% of customers say AI makes their experience better.", color: "#16a34a" },
                { stat: "7", label: "New AI agents launching", detail: "Marketing, Customer, Payments, Accounting, Finance, Payroll, Project Management — each needs AI+HI orchestration.", color: "#d97706" },
              ].map((c, i) => (
                <div key={i} style={{ padding: "24px 20px", border: "1px solid #e7e5e4", borderRadius: 12, background: "#fff" }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: c.color, letterSpacing: "-0.02em", fontFamily: "'IBM Plex Mono', monospace" }}>{c.stat}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, marginBottom: 8 }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: "#a8a29e", lineHeight: 1.5 }}>{c.detail}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: 28, background: "#1c1917", color: "#fafaf9", borderRadius: 14, marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace" }}>THE ORCHESTRATION QUESTION</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, lineHeight: 1.4 }}>Every AI agent interaction creates a routing decision: should AI handle this alone, should AI prepare a brief for an expert, or should a human expert lead?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 0, alignItems: "center" }}>
                <div style={{ padding: 16, background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600, marginBottom: 6 }}>VEP TODAY</div>
                  <div style={{ fontSize: 13, color: "#d6d3d1", lineHeight: 1.6 }}>Expert routing for tax (TT Live) and bookkeeping (QB Live). AI summarizes calls, provides real-time suggestions, scores quality, predicts resolution likelihood.</div>
                </div>
                <div style={{ textAlign: "center", fontSize: 20, color: "#78716c" }}>{"\u2192"}</div>
                <div style={{ padding: 16, background: "rgba(37,99,235,0.15)", borderRadius: 10, border: "1px solid rgba(37,99,235,0.3)" }}>
                  <div style={{ fontSize: 12, color: "#93c5fd", fontWeight: 600, marginBottom: 6 }}>VEP NEXT</div>
                  <div style={{ fontSize: 13, color: "#d6d3d1", lineHeight: 1.6 }}>Confidence-based routing across ALL agents. AI pre-work for expert preparation. Unified observability: AI-only vs AI+HI outcome measurement. New expert types: marketing, finance, payments advisory.</div>
                </div>
              </div>
            </div>
            <button onClick={() => setActiveSection("simulator")} style={{ padding: "14px 28px", borderRadius: 10, border: "none", cursor: "pointer", background: "#1c1917", color: "#fafaf9", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>See the Routing Simulator {"\u2192"}</button>
          </div>
        )}
        {activeSection === "simulator" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>INTERACTIVE SIMULATION</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>VEP Routing Decision Engine</h2>
              <p style={{ fontSize: 15, color: "#78716c", margin: 0 }}>Four scenarios across TurboTax Live, QuickBooks Live, and AI Agent workflows. Click any card to watch VEP decide the routing path.</p>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {Object.entries(ROUTING_MODES).map(([key, m]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, background: m.color + "12", border: "1px solid " + m.color + "33" }}>
                  <span>{m.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{m.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 32 }}>
              {SCENARIOS.map(s => { const mode = ROUTING_MODES[s.routingDecision]; return (
                <button key={s.id} onClick={() => runSimulation(s)} style={{ textAlign: "left", padding: 20, borderRadius: 12, cursor: "pointer", border: selectedScenario?.id === s.id ? "2px solid " + mode.color : "1px solid #e7e5e4", background: selectedScenario?.id === s.id ? mode.color + "06" : "#fff", fontFamily: "inherit", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#2563eb", marginBottom: 2 }}>{s.product}</div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{s.customer}</div>
                      <div style={{ fontSize: 12, color: "#a8a29e" }}>{s.persona} {"\u2022"} {s.city}</div>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: mode.color + "18", color: mode.color }}>{mode.icon} {mode.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#57534e", lineHeight: 1.5, padding: "8px 10px", background: "#fafaf9", borderRadius: 6, border: "1px solid #f5f5f4" }}><span style={{ fontWeight: 600, color: "#1c1917" }}>Trigger:</span> {s.trigger}</div>
                </button>
              ); })}
            </div>
            {selectedScenario && (
              <div style={{ border: "1px solid #e7e5e4", borderRadius: 14, background: "#fff", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f5f5f4", background: "#fafaf9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#2563eb", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>{selectedScenario.product.toUpperCase()}</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedScenario.customer}</div>
                      <div style={{ fontSize: 13, color: "#78716c" }}>{selectedScenario.persona} {"\u2022"} {selectedScenario.city}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#a8a29e" }}>AI Confidence</div>
                      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: selectedScenario.aiConfidence >= 0.8 ? "#16a34a" : selectedScenario.aiConfidence >= 0.6 ? "#d97706" : "#dc2626" }}>{(selectedScenario.aiConfidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { step: 1, label: "Signal Detected", detail: selectedScenario.product + ': "' + selectedScenario.trigger + '"', icon: "\uD83D\uDCE1" },
                      { step: 2, label: "Context Assembled", detail: selectedScenario.context, icon: "\uD83E\uDDE0" },
                      { step: 3, label: "Confidence Scored", detail: "AI confidence: " + (selectedScenario.aiConfidence * 100).toFixed(0) + "% — " + (selectedScenario.aiConfidence >= 0.8 ? "Above threshold. AI can handle autonomously." : selectedScenario.aiConfidence >= 0.6 ? "Moderate. AI + Expert recommended." : "Below threshold. Expert routing required."), icon: "\uD83D\uDCCA" },
                      { step: 4, label: "Routing Decision", detail: selectedScenario.rationale, icon: ROUTING_MODES[selectedScenario.routingDecision].icon },
                      { step: 5, label: "Outcome", detail: selectedScenario.expectedOutcome + " | Impact: " + selectedScenario.revenueImpact, icon: "\u2705" },
                    ].map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 14, padding: "14px 16px", borderRadius: 10, background: simulationStep >= s.step ? "#f5f5f4" : "transparent", border: simulationStep >= s.step ? "1px solid #e7e5e4" : "1px solid transparent", opacity: simulationStep >= s.step ? 1 : 0.25, transition: "all 0.4s ease", transform: simulationStep >= s.step ? "translateX(0)" : "translateX(-8px)" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: simulationStep >= s.step ? "#1c1917" : "#e7e5e4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{s.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.label}</div>
                          <div style={{ fontSize: 13, color: "#57534e", lineHeight: 1.5 }}>{s.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {simulationStep >= 5 && (
                    <div style={{ display: "grid", gridTemplateColumns: selectedScenario.expertMatch ? "1fr 1fr" : "1fr", gap: 16, marginTop: 20 }}>
                      <div style={{ padding: 16, background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 8, letterSpacing: "0.05em" }}>AI PRE-WORK (COMPLETED BEFORE EXPERT JOINS)</div>
                        {selectedScenario.aiActions.map((a, i) => (
                          <div key={i} style={{ fontSize: 12, color: "#1e40af", marginBottom: 4, paddingLeft: 12, borderLeft: "2px solid #93c5fd", lineHeight: 1.5 }}>{a}</div>
                        ))}
                      </div>
                      {selectedScenario.expertMatch && (
                        <div style={{ padding: 16, background: "#fef3c7", borderRadius: 10, border: "1px solid #fcd34d" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 8, letterSpacing: "0.05em" }}>VEP EXPERT MATCH</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#78350f" }}>{selectedScenario.expertMatch.name}</div>
                          <div style={{ fontSize: 12, color: "#92400e", marginBottom: 8 }}>{selectedScenario.expertMatch.specialization}</div>
                          <div style={{ fontSize: 12, color: "#a16207" }}>{"\u2B50"} {selectedScenario.expertMatch.rating} {"\u2022"} {selectedScenario.expertMatch.sessions} sessions {"\u2022"} {selectedScenario.expertMatch.lang}</div>
                          <div style={{ marginTop: 10, padding: "6px 12px", background: "#fde68a", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#78350f" }}>Expert receives AI-prepared brief before session starts</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {activeSection === "architecture" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>PLATFORM ARCHITECTURE</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>VEP Orchestration Layer</h2>
              <p style={{ fontSize: 15, color: "#78716c", margin: 0 }}>Six capability layers that enable VEP to orchestrate between AI-only, AI+Expert, and Expert-led interactions across all Intuit products.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { layer: "SIGNAL INGESTION", desc: "Captures triggers from across the Intuit ecosystem — product events, agent outputs, customer behavior signals", components: ["TurboTax Event Stream", "QB Agent Output Bus", "Customer Behavior Tracker", "Intuit Assist Signal API"], color: "#16a34a" },
                { layer: "CONFIDENCE ENGINE", desc: "Scores AI ability to handle each interaction autonomously, factoring in complexity, customer history, and stakes", components: ["Use Case Classifier", "Customer History Analyzer", "Complexity Scorer", "Stakes Assessor (financial risk)"], color: "#2563eb" },
                { layer: "ROUTING DECISION", desc: "Applies business rules + ML model to decide: AI Autonomous, AI+Expert, Expert Required, or Self-Serve", components: ["Routing Rules Engine", "Cost-Benefit Calculator", "Expert Availability Check", "Queue Priority Manager"], color: "#7c3aed" },
                { layer: "EXPERT PREPARATION", desc: "Assembles AI-generated context so experts can start informed, not cold", components: ["Context Brief Generator", "Customer 360 Assembler", "AI Recommendation Pre-compute", "Session Context Injector"], color: "#d97706" },
                { layer: "SESSION ORCHESTRATION", desc: "Manages the live interaction — AI co-pilot for experts, action execution, real-time quality signals", components: ["Expert AI Co-pilot", "Real-time Suggestions", "Action Executor", "Call Summary Automation"], color: "#dc2626" },
                { layer: "OBSERVABILITY", desc: "Measures outcomes, compares AI-only vs AI+HI, feeds learning back into confidence scoring", components: ["Resolution Predictor", "Quality Scorer", "AI vs AI+HI A/B Framework", "Revenue Attribution Tracker"], color: "#0891b2" },
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
                        <span key={j} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: l.color + "10", color: l.color, border: "1px solid " + l.color + "25" }}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeSection === "metrics" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#a8a29e", marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>SUCCESS FRAMEWORK</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>VEP Metrics Framework</h2>
              <p style={{ fontSize: 15, color: "#78716c", margin: 0 }}>How to measure whether the AI+HI orchestration layer is delivering customer and business outcomes.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {[
                { category: "Platform Health", metrics: [
                  { name: "Routing Accuracy", target: ">90%", desc: "% of routing decisions that did not require manual override or customer escalation" },
                  { name: "Expert Prep Time Saved", target: "60% down", desc: "Reduction in time experts spend understanding context (AI brief vs cold start)" },
                  { name: "Session Start Latency", target: "<45s", desc: "Time from routing decision to expert connection (for routed sessions)" },
                ]},
                { category: "Customer Outcomes", metrics: [
                  { name: "Resolution Rate", target: ">92%", desc: "% of sessions resolved without follow-up needed (AI-only and AI+HI)" },
                  { name: "CSAT: AI+HI vs AI-only", target: "+15 pts", desc: "NPS delta between expert-assisted and AI-only sessions for same complexity tier" },
                  { name: "Customer Confidence", target: "4.5/5", desc: "Post-session confidence rating: I am confident this was done correctly" },
                ]},
                { category: "Business Impact", metrics: [
                  { name: "TT Live Conversion", target: "+8%", desc: "% increase in users upgrading from self-serve to TurboTax Live via VEP routing" },
                  { name: "Expert Utilization", target: ">75%", desc: "% of expert time spent in customer sessions vs idle/admin/waiting" },
                  { name: "Revenue per VEP Session", target: "Rs 2,400", desc: "Average incremental revenue generated per expert-assisted session" },
                ]},
                { category: "Learning Loop", metrics: [
                  { name: "Confidence Calibration", target: "+/-5%", desc: "Gap between predicted and actual success rate per confidence band" },
                  { name: "Automation Rate Trend", target: "70% to 85%", desc: "% of interactions handled AI-only — should increase as confidence model improves" },
                  { name: "Expert Feedback Coverage", target: "100%", desc: "% of AI+HI sessions where expert rates AI pre-work quality (feeds back into model)" },
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
      </div>
    </div>
  );
}
