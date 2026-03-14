/**
 * YieldChatbot.jsx
 *
 * A floating AI chatbot for your crop yield dashboard.
 * Fetches all rows from Final_Dataset_Yield and answers questions via Gemini.
 *
 * SETUP:
 *   1. npm install @supabase/supabase-js @google/generative-ai
 *   2. Replace GEMINI_API_KEY below
 *   3. Make sure supabaseClient.js is set up with your URL + anon key
 *   4. Import and drop <YieldChatbot /> anywhere in your dashboard layout
 */

import { useState, useRef, useEffect } from "react";
import { supabase } from "../../supabaseClient";

const API_BASE = "https://ricevision-cakt.onrender.com";

// ─── Schema + behaviour prompt ────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are an expert agricultural data analyst assistant for a crop yield dashboard.
You have access to real data from the table "Final_Dataset_Yield".

COLUMNS:
- districtname         : Name of the district
- predictedyield_kg_ha : Predicted crop yield in kg per hectare
- historicalavg_kg_ha  : Historical average yield in kg per hectare
- totalyield_kg        : Total yield in kg for the district
- yieldgap_kg_ha       : Gap between historical average and predicted yield (kg/ha)
- percent_change       : % change compared to historical average
- health_index_z       : Crop health index (z-score; higher = healthier)
- climate_stress_index : Climate stress level (higher = more stress)
- total_pixels         : Number of satellite pixels analysed
- severe_stress_pct    : Percentage of area under severe stress
- pest_attack_count    : Number of recorded pest attack incidents
- most_common_stage    : Most common crop growth stage in the district
- risk_score           : Overall risk score for the district
- est_harvest_date     : Estimated harvest date
- season               : Crop season (e.g. Kharif, Rabi)

RULES:
- Only answer based on the data given. Never fabricate numbers.
- Be concise, specific, and conversational.
- When listing districts, rank them if it makes sense.
- Format numbers to 2 decimal places where appropriate.
- If the user asks something you can't derive from the data, say so honestly.
- You can draw comparisons, spot trends, highlight risks, and suggest insights.

Example questions you can answer well:
  "Which district has the highest predicted yield?"
  "Which districts are under severe stress?"
  "What's the average risk score across all districts?"
  "Compare Kharif vs Rabi season performance"
  "Which district has the worst yield gap?"
`;

// ─── Fetch all rows from Final_Dataset_Yield ──────────────────────────────────
async function fetchYieldData() {
    const { data, error } = await supabase
        .from("Final_Dataset_Yield")
        .select("*");

    if (error) throw new Error(error.message);
    return data;
}

// ─── Ask Gemini (via backend) ─────────────────────────────────────────────────
async function askGemini(question, yieldData, chatHistory) {
    const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, yieldData, chatHistory }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
    }
    const { reply } = await res.json();
    return reply;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function YieldChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "👋 Hi! I can answer questions about your crop yield data — districts, risk scores, stress levels, harvest dates, and more. What would you like to know?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [yieldData, setYieldData] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const [dataLoading, setDataLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch data once when chat opens
    useEffect(() => {
        if (isOpen && !yieldData && !fetchError) {
            setDataLoading(true);
            fetchYieldData()
                .then(setYieldData)
                .catch((e) => setFetchError(e.message))
                .finally(() => setDataLoading(false));
        }
    }, [isOpen]);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    }, [isOpen]);

    const send = async () => {
        if (!input.trim() || loading || dataLoading || !yieldData) return;

        const userMsg = { role: "user", content: input.trim() };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput("");
        setLoading(true);

        try {
            const reply = await askGemini(userMsg.content, yieldData, messages);
            setMessages([...updated, { role: "assistant", content: reply }]);
        } catch (e) {
            setMessages([
                ...updated,
                {
                    role: "assistant",
                    content: `⚠️ Error: ${e.message}. Check your Gemini API key.`,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const statusText = fetchError
        ? "⚠️ Failed to load data"
        : dataLoading
            ? "Loading yield data…"
            : yieldData
                ? `✓ ${yieldData.length} districts loaded`
                : "";

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                title="Yield Assistant"
                className="chatbot-fab"
                style={styles.fab}
            >
                {isOpen ? (
                    <span style={{ fontSize: 18 }}>✕</span>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.07-1.38A9.954 9.954 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
                            fill="white"
                        />
                        <circle cx="8.5" cy="12" r="1.2" fill="#1a3a2a" />
                        <circle cx="12" cy="12" r="1.2" fill="#1a3a2a" />
                        <circle cx="15.5" cy="12" r="1.2" fill="#1a3a2a" />
                    </svg>
                )}
            </button>

            {/* Chat window */}
            {isOpen && (
                <div style={styles.window}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.headerLeft}>
                            <div style={styles.avatar}>🌾</div>
                            <div>
                                <div style={styles.headerTitle}>Yield Assistant</div>
                                <div style={styles.headerSub}>{statusText}</div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages" style={styles.messages}>
                        {messages.map((m, i) => (
                            <div key={i} style={styles.msgRow(m.role)}>
                                {m.role === "assistant" && (
                                    <div style={styles.botAvatar}>🌾</div>
                                )}
                                <div style={styles.bubble(m.role)}>{m.content}</div>
                            </div>
                        ))}

                        {loading && (
                            <div style={styles.msgRow("assistant")}>
                                <div style={styles.botAvatar}>🌾</div>
                                <div style={{ ...styles.bubble("assistant"), ...styles.typing }}>
                                    <span style={styles.dot(0)} />
                                    <span style={styles.dot(1)} />
                                    <span style={styles.dot(2)} />
                                </div>
                            </div>
                        )}

                        {fetchError && (
                            <div style={styles.errorBanner}>
                                Failed to load Supabase data: {fetchError}
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Suggested questions (shown before first user message) */}
                    {messages.length === 1 && !dataLoading && yieldData && (
                        <div style={styles.suggestions}>
                            {[
                                "Which district has highest yield?",
                                "Districts with severe stress?",
                                "Worst yield gap?",
                                "Average risk score?",
                            ].map((q) => (
                                <button
                                    key={q}
                                    className="chatbot-chip"
                                    style={styles.chip}
                                    onClick={() => {
                                        setInput(q);
                                        setTimeout(() => inputRef.current?.focus(), 50);
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div style={styles.inputRow}>
                        <input
                            ref={inputRef}
                            className="chatbot-input"
                            style={styles.input}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && send()}
                            placeholder={
                                dataLoading
                                    ? "Loading data…"
                                    : fetchError
                                        ? "Data failed to load"
                                        : "Ask about your yield data…"
                            }
                            disabled={dataLoading || !!fetchError}
                        />
                        <button
                            style={{
                                ...styles.sendBtn,
                                opacity: loading || dataLoading || !yieldData ? 0.45 : 1,
                            }}
                            onClick={send}
                            disabled={loading || dataLoading || !yieldData}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Typing animation keyframes */}
            <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chatbot-input::placeholder { color: rgba(255,255,255,0.25); }
        .chatbot-input:focus { border-color: rgba(16,185,129,0.6) !important; }
        .chatbot-messages::-webkit-scrollbar { width: 4px; }
        .chatbot-messages::-webkit-scrollbar-track { background: transparent; }
        .chatbot-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .chatbot-chip:hover { background: rgba(16,185,129,0.15) !important; border-color: rgba(16,185,129,0.6) !important; }
        .chatbot-fab:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(16,185,129,0.45) !important; }
      `}</style>
        </>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const EMERALD      = "#10b981";
const EMERALD_DARK = "#065f46";

const styles = {
    fab: {
        position: "fixed",
        bottom: 28,
        right: 28,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #065f46, #10b981)",
        border: "1px solid rgba(16,185,129,0.4)",
        cursor: "pointer",
        boxShadow: "0 4px 24px rgba(16,185,129,0.35), 0 2px 8px rgba(0,0,0,0.4)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    window: {
        position: "fixed",
        bottom: 96,
        right: 28,
        width: 370,
        height: 520,
        background: "rgba(8, 15, 28, 0.88)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.12)",
        borderTop: "1px solid rgba(255,255,255,0.22)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9998,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        animation: "fadeSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
    },
    header: {
        background: "rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(6,95,70,0.8), rgba(16,185,129,0.6))",
        border: "1px solid rgba(16,185,129,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 17,
    },
    headerTitle: {
        color: "rgba(255,255,255,0.92)",
        fontWeight: 700,
        fontSize: 13.5,
        letterSpacing: "0.01em",
        lineHeight: 1.3,
    },
    headerSub: {
        color: "rgba(255,255,255,0.35)",
        fontSize: 10.5,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        marginTop: 1,
    },
    closeBtn: {
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.6)",
        width: 28,
        height: 28,
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s, color 0.15s",
    },
    messages: {
        flex: 1,
        overflowY: "auto",
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "transparent",
    },
    msgRow: (role) => ({
        display: "flex",
        flexDirection: role === "user" ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 7,
    }),
    botAvatar: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "rgba(16,185,129,0.15)",
        border: "1px solid rgba(16,185,129,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        flexShrink: 0,
    },
    bubble: (role) => ({
        maxWidth: "78%",
        padding: "10px 14px",
        borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        fontSize: 13,
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
        background: role === "user"
            ? "linear-gradient(135deg, #065f46, #10b981)"
            : "rgba(255,255,255,0.07)",
        color: "rgba(255,255,255,0.88)",
        border: role === "user"
            ? "1px solid rgba(16,185,129,0.4)"
            : "1px solid rgba(255,255,255,0.08)",
        boxShadow: role === "user"
            ? "0 4px 16px rgba(16,185,129,0.2)"
            : "0 2px 8px rgba(0,0,0,0.2)",
    }),
    typing: {
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "12px 16px",
    },
    dot: (i) => ({
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: EMERALD,
        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
    }),
    suggestions: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "8px 12px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
    },
    chip: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(255,255,255,0.65)",
        borderRadius: 20,
        padding: "5px 11px",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        transition: "background 0.15s, border-color 0.15s",
    },
    inputRow: {
        display: "flex",
        padding: "10px 12px",
        gap: 8,
        background: "rgba(255,255,255,0.03)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
    },
    input: {
        flex: 1,
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: "9px 14px",
        fontSize: 13,
        outline: "none",
        background: "rgba(255,255,255,0.06)",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        color: "rgba(255,255,255,0.88)",
        transition: "border-color 0.2s",
    },
    sendBtn: {
        background: "linear-gradient(135deg, #065f46, #10b981)",
        border: "1px solid rgba(16,185,129,0.4)",
        borderRadius: 12,
        width: 42,
        height: 42,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "opacity 0.2s",
        boxShadow: "0 4px 12px rgba(16,185,129,0.25)",
    },
    errorBanner: {
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.25)",
        color: "rgba(252,165,165,0.9)",
        fontSize: 12,
        padding: "8px 12px",
        borderRadius: 10,
        margin: "0 4px",
    },
};