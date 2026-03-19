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
import { apiFetch } from "../../api/apiFetch";
import { useTheme } from "../../context/ThemeContext";

// ─── Fetch all rows from Final_Dataset_Yield ──────────────────────────────────
async function fetchYieldData() {
    const { data, error } = await supabase
        .from("Final_Dataset_Yield")
        .select("*");

    if (error) throw new Error(error.message);
    return data;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function YieldChatbot() {
    const { isDark } = useTheme();
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
    const [intermediateSteps, setIntermediateSteps] = useState([]);
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
    }, [isOpen, yieldData, fetchError]);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, intermediateSteps]);

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
        setIntermediateSteps([]);
        setLoading(true);

        try {
            const res = await apiFetch(`/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: userMsg.content, yieldData, chatHistory: messages }),
            });

            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const { reply, intermediate_steps } = await res.json();

            if (intermediate_steps) setIntermediateSteps(intermediate_steps);
            setMessages([...updated, { role: "assistant", content: reply }]);
        } catch (e) {
            setMessages([
                ...updated,
                {
                    role: "assistant",
                    content: `⚠️ Error: ${e.message}.`,
                },
            ]);
        } finally {
            setLoading(false);
            setIntermediateSteps([]);
        }
    };

    const statusText = fetchError
        ? "⚠️ Failed to load data"
        : dataLoading
            ? "Loading yield data…"
            : yieldData
                ? `✓ ${yieldData.length} districts loaded`
                : "";

    // ─── Theme Configuration ──────────────────────────────────────────────
    const theme = {
        emerald: isDark ? "#10b981" : "#5CE65C",
        emeraldDark: isDark ? "#065f46" : "#45b545",
        bg: isDark ? "rgba(8, 15, 28, 0.88)" : "rgba(255, 255, 255, 0.95)",
        headerBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
        borderTop: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.1)",
        textMain: isDark ? "rgba(255,255,255,0.92)" : "#1e293b",
        textSub: isDark ? "rgba(255,255,255,0.85)" : "#64748b",
        bubbleBot: isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9",
        bubbleUser: "linear-gradient(135deg, #065f46, #10b981)",
        inputBg: isDark ? "rgba(255,255,255,0.06)" : "#f8fafc",
        suggestionBg: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
        chipBg: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
        chipText: isDark ? "rgba(255,255,255,0.95)" : "#334155",
        shadow: isDark ? "0 24px 64px rgba(0,0,0,0.7)" : "0 20px 50px rgba(0,0,0,0.1)",
        backdrop: isDark ? "blur(40px) saturate(180%)" : "blur(20px)",
    };

    const dynamicStyles = {
        fab: {
            position: "fixed",
            bottom: 28,
            right: 28,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${theme.emeraldDark}, ${theme.emerald})`,
            border: `1px solid ${isDark ? "rgba(16,185,129,0.4)" : "transparent"}`,
            cursor: "pointer",
            boxShadow: `0 4px 24px ${isDark ? "rgba(16,185,129,0.35)" : "rgba(16,185,129,0.25)"}, 0 2px 8px rgba(0,0,0,0.2)`,
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
            background: theme.bg,
            backdropFilter: theme.backdrop,
            WebkitBackdropFilter: theme.backdrop,
            borderRadius: 24,
            border: `1px solid ${theme.borderColor}`,
            borderTop: `1px solid ${theme.borderTop}`,
            boxShadow: theme.shadow,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9998,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            animation: "fadeSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        },
        header: {
            background: theme.headerBg,
            borderBottom: `1px solid ${theme.borderColor}`,
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
            background: `linear-gradient(135deg, ${theme.emeraldDark}, ${theme.emerald})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
        },
        headerTitle: {
            color: theme.textMain,
            fontWeight: 700,
            fontSize: 13.5,
            letterSpacing: "0.01em",
            lineHeight: 1.3,
        },
        headerSub: {
            color: theme.textSub,
            fontSize: 10.5,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginTop: 1,
        },
        closeBtn: {
            background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
            border: `1px solid ${theme.borderColor}`,
            color: theme.textSub,
            width: 28,
            height: 28,
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
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
            background: isDark ? "rgba(16,185,129,0.15)" : "#ecfdf5",
            border: `1px solid ${isDark ? "rgba(16,185,129,0.3)" : "#10b98144"}`,
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
            background: role === "user" ? theme.bubbleUser : theme.bubbleBot,
            color: role === "user" ? "white" : theme.textMain,
            border: role === "user" ? `1px solid ${isDark ? "rgba(16,185,129,0.4)" : "transparent"}` : `1px solid ${theme.borderColor}`,
            boxShadow: role === "user" ? "0 4px 12px rgba(16,185,129,0.15)" : "none",
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
            background: theme.emerald,
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }),
        suggestions: {
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            padding: "8px 12px",
            borderTop: `1px solid ${theme.borderColor}`,
            background: theme.suggestionBg,
        },
        chip: {
            background: theme.chipBg,
            border: `1px solid ${theme.borderColor}`,
            color: theme.chipText,
            borderRadius: 20,
            padding: "5px 11px",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            transition: "all 0.15s",
        },
        inputRow: {
            display: "flex",
            padding: "10px 12px",
            gap: 8,
            background: theme.headerBg,
            borderTop: `1px solid ${theme.borderColor}`,
        },
        input: {
            flex: 1,
            border: `1px solid ${theme.borderColor}`,
            borderRadius: 12,
            padding: "9px 14px",
            fontSize: 13,
            outline: "none",
            background: theme.inputBg,
            color: theme.textMain,
            transition: "border-color 0.2s",
        },
        sendBtn: {
            background: `linear-gradient(135deg, ${theme.emeraldDark}, ${theme.emerald})`,
            border: "none",
            borderRadius: 12,
            width: 42,
            height: 42,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(16,185,129,0.25)",
        },
        errorBanner: {
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444",
            fontSize: 12,
            padding: "8px 12px",
            borderRadius: 10,
            margin: "0 4px",
        },
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                title="Yield Assistant"
                className="chatbot-fab"
                style={dynamicStyles.fab}
            >
                {isOpen ? (
                    <span style={{ fontSize: 18, color: "white" }}>✕</span>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.07-1.38A9.954 9.954 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
                            fill="white"
                        />
                        <circle cx="8.5" cy="12" r="1.2" fill={theme.emeraldDark} />
                        <circle cx="12" cy="12" r="1.2" fill={theme.emeraldDark} />
                        <circle cx="15.5" cy="12" r="1.2" fill={theme.emeraldDark} />
                    </svg>
                )}
            </button>

            {/* Chat window */}
            {isOpen && (
                <div style={dynamicStyles.window}>
                    {/* Header */}
                    <div style={dynamicStyles.header}>
                        <div style={dynamicStyles.headerLeft}>
                            <div style={dynamicStyles.avatar}>🌾</div>
                            <div>
                                <div style={dynamicStyles.headerTitle}>Yield Assistant</div>
                                <div style={dynamicStyles.headerSub}>{statusText}</div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={dynamicStyles.closeBtn}>
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages" style={dynamicStyles.messages}>
                        {messages.map((m, i) => (
                            <div key={i} style={dynamicStyles.msgRow(m.role)}>
                                {m.role === "assistant" && (
                                    <div style={dynamicStyles.botAvatar}>🌾</div>
                                )}
                                <div style={dynamicStyles.bubble(m.role)}>{m.content}</div>
                            </div>
                        ))}

                        {intermediateSteps.map((step, i) => (
                            <div key={`step-${i}`} style={{
                                fontSize: '10px',
                                color: theme.textSub,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 8px',
                                background: theme.headerBg,
                                borderRadius: 8,
                                alignSelf: 'flex-start',
                                margin: '2px 0'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>terminal</span>
                                <span>Agent calling <b>{step.tool}</b>...</span>
                            </div>
                        ))}

                        {loading && (
                            <div style={dynamicStyles.msgRow("assistant")}>
                                <div style={dynamicStyles.botAvatar}>🌾</div>
                                <div style={{ ...dynamicStyles.bubble("assistant"), ...dynamicStyles.typing }}>
                                    <span style={dynamicStyles.dot(0)} />
                                    <span style={dynamicStyles.dot(1)} />
                                    <span style={dynamicStyles.dot(2)} />
                                </div>
                            </div>
                        )}

                        {fetchError && (
                            <div style={dynamicStyles.errorBanner}>
                                Failed to load Supabase data: {fetchError}
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Suggested questions (shown before first user message) */}
                    {messages.length === 1 && !dataLoading && yieldData && (
                        <div style={dynamicStyles.suggestions}>
                            {[
                                "Which district has highest yield?",
                                "Districts with severe stress?",
                                "Worst yield gap?",
                                "Average risk score?",
                            ].map((q) => (
                                <button
                                    key={q}
                                    className="chatbot-chip"
                                    style={dynamicStyles.chip}
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
                    <div style={dynamicStyles.inputRow}>
                        <input
                            ref={inputRef}
                            className={`chatbot-input ${isDark ? 'dark' : 'light'}`}
                            style={dynamicStyles.input}
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
                                ...dynamicStyles.sendBtn,
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

            {/* Global Styles */}
            <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chatbot-input::placeholder { color: ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'}; }
        .chatbot-input:focus { border-color: ${theme.emerald} !important; box-shadow: 0 0 0 2px ${theme.emerald}22; }
        .chatbot-messages::-webkit-scrollbar { width: 4px; }
        .chatbot-messages::-webkit-scrollbar-track { background: transparent; }
        .chatbot-messages::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; border-radius: 4px; }
        .chatbot-chip:hover { background: ${theme.emerald}11 !important; border-color: ${theme.emerald}88 !important; transform: translateY(-1px); }
        .chatbot-fab:hover { transform: scale(1.08); box-shadow: 0 8px 32px ${theme.emerald}44 !important; }
      `}</style>
        </>
    );
}