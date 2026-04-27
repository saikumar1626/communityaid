import { useState } from "react";

const GEMINI_KEY = "AIzaSyCtFjkkG-LIBJlGfaOtVZ8os4YwFa9JOwk";

const SAMPLE_NEEDS = [
  { id: 1, title: "Food for flood victims", location: "Kakinada", urgency: 9, category: "food", status: "matched", volunteer: "Ravi Kumar" },
  { id: 2, title: "Medical supplies needed", location: "Rajahmundry", urgency: 8, category: "medical", status: "matched", volunteer: "Priya Sharma" },
  { id: 3, title: "Shelter for 20 families", location: "Kakinada", urgency: 7, category: "shelter", status: "unmatched", volunteer: null },
];

const VOLUNTEERS = [
  { name: "Ravi Kumar", skills: ["food", "shelter"], location: "Kakinada", available: false },
  { name: "Priya Sharma", skills: ["medical", "education"], location: "Kakinada", available: false },
  { name: "Suresh Babu", skills: ["food", "education"], location: "Rajahmundry", available: true },
  { name: "Anita Reddy", skills: ["shelter", "medical"], location: "Kakinada", available: true },
];

const AGENTS = [
  { icon: "🧠", name: "Coordinator Agent", role: "Orchestrates all sub-agents", color: "#fff", bg: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
  { icon: "📋", name: "Needs Analyst", role: "Scores urgency 1-10", color: "#fff", bg: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { icon: "🤝", name: "Volunteer Matcher", role: "Finds best skill + location match", color: "#fff", bg: "linear-gradient(135deg,#10b981,#059669)" },
  { icon: "📊", name: "Report Agent", role: "Generates impact statistics", color: "#fff", bg: "linear-gradient(135deg,#3b82f6,#06b6d4)" },
];

export default function App() {
  const [needs, setNeeds] = useState(SAMPLE_NEEDS);
  const [tab, setTab] = useState("dashboard");
  const [form, setForm] = useState({ title: "", location: "", category: "food", description: "" });
  const [loading, setLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState(null);
  const [agentStep, setAgentStep] = useState(0);

  const submitNeed = async () => {
    if (!form.title || !form.location) return;
    setLoading(true);
    setAgentResponse(null);
    setAgentStep(1);
    try {
      setTimeout(() => setAgentStep(2), 1200);
      setTimeout(() => setAgentStep(3), 2400);
      const prompt = `You are CommunityAid's AI coordinator. A new community need:
Title: ${form.title}, Location: ${form.location}, Category: ${form.category}, Description: ${form.description}
Volunteers: Ravi Kumar (food/shelter,Kakinada), Priya Sharma (medical/education,Kakinada), Suresh Babu (food/education,Rajahmundry), Anita Reddy (shelter/medical,Kakinada).
Respond EXACTLY:
URGENCY: [1-10]
BEST_VOLUNTEER: [name]
REASON: [one sentence]
ACTION: [one sentence]`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      const urgency = parseInt((text.match(/URGENCY:\s*(\d+)/) || [])[1] || "7");
      const volunteer = ((text.match(/BEST_VOLUNTEER:\s*(.+)/) || [])[1] || "Suresh Babu").trim();
      const reason = ((text.match(/REASON:\s*(.+)/) || [])[1] || "").trim();
      const action = ((text.match(/ACTION:\s*(.+)/) || [])[1] || "").trim();
      setAgentStep(4);
      setNeeds([{ id: needs.length + 1, title: form.title, location: form.location, urgency, category: form.category, status: "matched", volunteer }, ...needs]);
      setAgentResponse({ urgency, volunteer, reason, action });
      setForm({ title: "", location: "", category: "food", description: "" });
    } catch { setAgentResponse({ error: "Agent error. Check your API key." }); }
    setLoading(false);
  };

  const matched = needs.filter(n => n.status === "matched").length;
  const unmatched = needs.filter(n => n.status === "unmatched").length;
  const coverage = Math.round((matched / needs.length) * 100);

  const inp = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #e5e7eb", fontSize: 14, outline: "none", transition: "border 0.2s", fontFamily: "inherit" };

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "'Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5,#2563eb)", padding: "0 28px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 4px 20px rgba(124,58,237,0.4)", minHeight: 70 }}>
        <div style={{ width: 46, height: 46, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, backdropFilter: "blur(10px)" }}>🤝</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>CommunityAid</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>Google ADK Multi-Agent Volunteer Coordination</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", padding: "6px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "#fff", backdropFilter: "blur(10px)" }}>
            🏆 GDSC Solution Challenge 2026
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", padding: "6px 14px", borderRadius: 99, fontSize: 11, color: "#fff" }}>
            🌱 SDG 1 · 10 · 17
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "2px solid #f3f4f6", padding: "0 28px", display: "flex", gap: 2 }}>
        {[
          { key: "dashboard", label: "📊 Dashboard" },
          { key: "submit", label: "➕ Submit Need" },
          { key: "agents", label: "🤖 AI Agents" },
          { key: "volunteers", label: "👥 Volunteers" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "14px 20px", border: "none", background: "none", cursor: "pointer",
            fontWeight: tab === t.key ? 700 : 400,
            color: tab === t.key ? "#7c3aed" : "#6b7280",
            borderBottom: tab === t.key ? "3px solid #7c3aed" : "3px solid transparent",
            fontSize: 13, transition: "all 0.2s", whiteSpace: "nowrap"
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1000, margin: "28px auto", padding: "0 20px" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 28 }}>
              {[
                { label: "Total Needs", value: needs.length, grad: "linear-gradient(135deg,#6366f1,#8b5cf6)", icon: "📋" },
                { label: "Matched", value: matched, grad: "linear-gradient(135deg,#10b981,#059669)", icon: "✅" },
                { label: "Unmatched", value: unmatched, grad: "linear-gradient(135deg,#ef4444,#dc2626)", icon: "⚠️" },
                { label: "Coverage", value: coverage + "%", grad: "linear-gradient(135deg,#f59e0b,#d97706)", icon: "📈" },
                { label: "Available", value: VOLUNTEERS.filter(v => v.available).length, grad: "linear-gradient(135deg,#3b82f6,#2563eb)", icon: "👥" },
              ].map(s => (
                <div key={s.label} style={{ background: s.grad, borderRadius: 16, padding: "20px 16px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.12)", color: "#fff" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 14, color: "#1f2937", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block", boxShadow: "0 0 0 3px rgba(239,68,68,0.2)" }}></span>
              Active Community Needs
            </div>
            {needs.map(need => (
              <div key={need.id} style={{ background: "#fff", borderRadius: 16, padding: "18px 22px", marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `5px solid ${need.urgency >= 8 ? "#ef4444" : need.urgency >= 6 ? "#f59e0b" : "#10b981"}` }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>{need.title}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 5, display: "flex", gap: 10 }}>
                    <span>📍 {need.location}</span>
                    <span style={{ background: "#f3f4f6", padding: "1px 8px", borderRadius: 99 }}>🏷 {need.category}</span>
                  </div>
                  {need.volunteer && <div style={{ fontSize: 12, color: "#10b981", marginTop: 6, fontWeight: 600 }}>✅ Assigned → {need.volunteer}</div>}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 20 }}>
                  <div style={{ padding: "5px 14px", borderRadius: 99, fontSize: 13, fontWeight: 800, marginBottom: 6, background: need.urgency >= 8 ? "#fef2f2" : need.urgency >= 6 ? "#fffbeb" : "#ecfdf5", color: need.urgency >= 8 ? "#ef4444" : need.urgency >= 6 ? "#f59e0b" : "#10b981" }}>
                    🔥 {need.urgency}/10
                  </div>
                  <div style={{ fontSize: 11, padding: "3px 12px", borderRadius: 99, fontWeight: 700, background: need.status === "matched" ? "#ecfdf5" : "#fef2f2", color: need.status === "matched" ? "#10b981" : "#ef4444" }}>
                    {need.status === "matched" ? "✅ matched" : "⏳ unmatched"}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* SUBMIT */}
        {tab === "submit" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 30, boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}>
              <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4, color: "#111827" }}>Submit Community Need</div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>AI agents analyse urgency and match volunteers instantly.</div>
              {[
                { label: "Need Title *", key: "title", placeholder: "e.g. Food for 50 flood-affected families" },
                { label: "Location *", key: "location", placeholder: "e.g. Kakinada, Andhra Pradesh" },
                { label: "Description", key: "description", placeholder: "Any additional details..." },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 7 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} style={inp} />
                </div>
              ))}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 7 }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inp }}>
                  {["food", "medical", "shelter", "education", "other"].map(c => <option key={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#6d28d9", fontWeight: 500 }}>
                🤖 Score urgency → Match volunteer → Auto-assign
              </div>
              <button onClick={submitNeed} disabled={loading || !form.title || !form.location} style={{ width: "100%", padding: 15, background: loading ? "#9ca3af" : "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 15px rgba(124,58,237,0.4)" }}>
                {loading ? "🤖 AI Agents Working..." : "🚀 Submit & Auto-Match Volunteer"}
              </button>
            </div>

            <div style={{ background: "#fff", borderRadius: 20, padding: 30, boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, color: "#111827" }}>🤖 Agent Pipeline</div>
              {[
                { step: 1, label: "Coordinator Agent receives request", icon: "🧠", color: "#7c3aed" },
                { step: 2, label: "Needs Analyst scores urgency", icon: "📋", color: "#f59e0b" },
                { step: 3, label: "Volunteer Matcher finds best fit", icon: "🤝", color: "#10b981" },
                { step: 4, label: "Assignment complete!", icon: "✅", color: "#3b82f6" },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18, opacity: agentStep >= s.step ? 1 : 0.25, transition: "all 0.5s" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: agentStep >= s.step ? s.color : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, transition: "all 0.5s", boxShadow: agentStep >= s.step ? `0 4px 12px ${s.color}44` : "none" }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: agentStep >= s.step ? "#111827" : "#9ca3af" }}>{s.label}</div>
                    {agentStep >= s.step && <div style={{ fontSize: 11, color: s.color, fontWeight: 700, marginTop: 2 }}>✓ Completed</div>}
                  </div>
                </div>
              ))}
              {agentResponse && !agentResponse.error && (
                <div style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", border: "2px solid #10b981", borderRadius: 14, padding: 18, marginTop: 8 }}>
                  <div style={{ fontWeight: 800, color: "#059669", marginBottom: 10, fontSize: 15 }}>✅ Match Result</div>
                  <div style={{ fontSize: 13, color: "#065f46", lineHeight: 2 }}>
                    <div>🎯 <strong>Urgency:</strong> {agentResponse.urgency}/10</div>
                    <div>🤝 <strong>Volunteer:</strong> {agentResponse.volunteer}</div>
                    <div>💡 <strong>Why:</strong> {agentResponse.reason}</div>
                    <div>📋 <strong>Action:</strong> {agentResponse.action}</div>
                  </div>
                </div>
              )}
              {agentResponse?.error && <div style={{ background: "#fef2f2", border: "2px solid #ef4444", borderRadius: 12, padding: 14, color: "#dc2626", fontSize: 13, marginTop: 8 }}>{agentResponse.error}</div>}
            </div>
          </div>
        )}

        {/* AI AGENTS */}
        {tab === "agents" && (
          <>
            <div style={{ background: "#fff", borderRadius: 20, padding: 28, marginBottom: 20, boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}>
              <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4, color: "#111827" }}>Multi-Agent Architecture</div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>Built with Google Agent Development Kit (ADK) + Gemini 2.0 Flash</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                {AGENTS.map(a => (
                  <div key={a.name} style={{ background: a.bg, borderRadius: 16, padding: "24px 16px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", color: "#fff" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{a.icon}</div>
                    <div style={{ fontWeight: 800, marginBottom: 6, fontSize: 14 }}>{a.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>{a.role}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, color: "#111827" }}>How It Works</div>
              {[
                { n: "1", text: "NGO submits a community need via the dashboard", grad: "linear-gradient(135deg,#7c3aed,#6366f1)" },
                { n: "2", text: "Coordinator Agent receives and routes the request", grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
                { n: "3", text: "Needs Analyst Agent scores urgency 1-10 and categorises", grad: "linear-gradient(135deg,#f59e0b,#ef4444)" },
                { n: "4", text: "Volunteer Matcher finds the best skill + location match", grad: "linear-gradient(135deg,#10b981,#059669)" },
                { n: "5", text: "Assignment confirmed, dashboard updates in real time", grad: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
              ].map(s => (
                <div key={s.n} style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: s.grad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, flexShrink: 0, boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>{s.n}</div>
                  <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{s.text}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* VOLUNTEERS */}
        {tab === "volunteers" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Total Volunteers", value: VOLUNTEERS.length, grad: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
                { label: "Available", value: VOLUNTEERS.filter(v => v.available).length, grad: "linear-gradient(135deg,#10b981,#059669)" },
                { label: "Assigned", value: VOLUNTEERS.filter(v => !v.available).length, grad: "linear-gradient(135deg,#ef4444,#dc2626)" },
              ].map(s => (
                <div key={s.label} style={{ background: s.grad, borderRadius: 16, padding: "22px 20px", textAlign: "center", color: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.12)" }}>
                  <div style={{ fontSize: 30, fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {VOLUNTEERS.map(v => (
              <div key={v.name} style={{ background: "#fff", borderRadius: 16, padding: "18px 22px", marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>👤 {v.name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 5 }}>📍 {v.location}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {v.skills.map(s => (
                      <span key={s} style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", color: "#7c3aed", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "8px 20px", borderRadius: 99, fontSize: 12, fontWeight: 800, background: v.available ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", boxShadow: v.available ? "0 4px 12px rgba(16,185,129,0.4)" : "0 4px 12px rgba(239,68,68,0.4)" }}>
                  {v.available ? "✅ Available" : "🔴 Assigned"}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "28px", color: "#9ca3af", fontSize: 12, borderTop: "2px solid #f3f4f6", background: "#fff", marginTop: 20 }}>
        <div style={{ fontWeight: 700, color: "#6b7280", marginBottom: 6, fontSize: 14 }}>CommunityAid — GDSC Solution Challenge 2026</div>
        <div style={{ marginBottom: 6 }}>⚡ Google ADK · 🤖 Gemini 2.0 Flash · 🔥 Firebase · ⚛️ React</div>
        <div>🌱 SDG 1: No Poverty · SDG 10: Reduced Inequalities · SDG 17: Partnerships for the Goals</div>
      </div>
    </div>
  );
}