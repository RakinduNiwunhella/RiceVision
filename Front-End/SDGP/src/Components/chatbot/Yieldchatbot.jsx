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
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "./supabaseClient"; // adjust path if needed


// 🔁 Replace with your Gemini API key (get it from https://aistudio.google.com/app/apikey)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

// ─── Ask Gemini ───────────────────────────────────────────────────────────────
async function askGemini(question, yieldData, chatHistory) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const history = chatHistory
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");

    const prompt = `
${SYSTEM_PROMPT}

--- LIVE DATA (${yieldData.length} districts) ---
${JSON.stringify(yieldData, null, 2)}

--- CONVERSATION HISTORY ---
${history || "None yet."}

--- NEW QUESTION ---
User: ${question}

Answer:`;

    const result = await model.generateContent(prompt);
    return result.response.text();
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
                    <div style={styles.messages}>
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
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&display=swap');
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const GREEN = "#2d6a4f";
const GREEN_LIGHT = "#52b788";
const BG = "#f0f7f4";

const styles = {
    fab: {
        position: "fixed",
        bottom: 28,
        right: 28,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 24px rgba(45,106,79,0.45)",
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
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9998,
        fontFamily: "'Sora', sans-serif",
        animation: "fadeSlideUp 0.25s ease",
    },
    header: {
        background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
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
        background: "rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
    },
    headerTitle: {
        color: "#fff",
        fontWeight: 600,
        fontSize: 14,
        lineHeight: 1.3,
    },
    headerSub: {
        color: "rgba(255,255,255,0.75)",
        fontSize: 11,
        marginTop: 1,
    },
    closeBtn: {
        background: "rgba(255,255,255,0.15)",
        border: "none",
        color: "#fff",
        width: 28,
        height: 28,
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    messages: {
        flex: 1,
        overflowY: "auto",
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: BG,
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
        background: "#d8f3dc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        flexShrink: 0,
    },
    bubble: (role) => ({
        maxWidth: "78%",
        padding: "10px 14px",
        borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        fontSize: 13.5,
        lineHeight: 1.55,
        whiteSpace: "pre-wrap",
        background: role === "user" ? GREEN : "#fff",
        color: role === "user" ? "#fff" : "#1a2e22",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
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
        background: GREEN_LIGHT,
        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
    }),
    suggestions: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "8px 12px",
        background: BG,
        borderTop: "1px solid #d8eedf",
    },
    chip: {
        background: "#fff",
        border: `1px solid ${GREEN_LIGHT}`,
        color: GREEN,
        borderRadius: 20,
        padding: "5px 11px",
        fontSize: 11.5,
        cursor: "pointer",
        fontFamily: "'Sora', sans-serif",
        transition: "background 0.15s",
    },
    inputRow: {
        display: "flex",
        padding: "10px 12px",
        gap: 8,
        background: "#fff",
        borderTop: "1px solid #e4f0e8",
    },
    input: {
        flex: 1,
        border: "1.5px solid #c8e6d0",
        borderRadius: 12,
        padding: "9px 14px",
        fontSize: 13.5,
        outline: "none",
        background: BG,
        fontFamily: "'Sora', sans-serif",
        color: "#1a2e22",
    },
    sendBtn: {
        background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
        border: "none",
        borderRadius: 12,
        width: 42,
        height: 42,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "opacity 0.2s",
    },
    errorBanner: {
        background: "#fee2e2",
        color: "#991b1b",
        fontSize: 12,
        padding: "8px 12px",
        borderRadius: 8,
        margin: "0 4px",
    },
};