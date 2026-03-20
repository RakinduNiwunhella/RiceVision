import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { fetchFaqs, submitComplaint } from "../../api/api";
import { useLanguage } from "../../context/LanguageContext";

const FAQ_TRANSLATION_KEYS = {
  "how does ricevision monitor paddy fields": {
    question: "helpFaqMonitorFieldsQ",
    answer: "helpFaqMonitorFieldsA",
  },
  "how often is satellite data updated": {
    question: "helpFaqSatelliteUpdateQ",
    answer: "helpFaqSatelliteUpdateA",
  },
  "do farmers need special equipment": {
    question: "helpFaqSpecialEquipmentQ",
    answer: "helpFaqSpecialEquipmentA",
  },
  "how accurate are the crop health insights": {
    question: "helpFaqAccuracyQ",
    answer: "helpFaqAccuracyA",
  },
  "who can access ricevision": {
    question: "helpFaqWhoCanAccessQ",
    answer: "helpFaqWhoCanAccessA",
  },
  "what is ricevision": {
    question: "helpFaqWhatIsQ",
    answer: "helpFaqWhatIsA",
  },
  "who can use ricevision": {
    question: "helpFaqWhoCanUseQ",
    answer: "helpFaqWhoCanUseA",
  },
};

const normalizeFaqLookup = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const HIDDEN_FAQ_QUESTIONS = new Set([
  normalizeFaqLookup("How often is data updated?"),
]);

const shouldHideFaq = (faq) => {
  const candidates = [
    faq?.question,
    faq?.question_en,
    faq?.question_si,
    faq?.question_ta,
    faq?.translations?.en?.question,
    faq?.translations?.si?.question,
    faq?.translations?.ta?.question,
  ];

  return candidates.some((candidate) =>
    HIDDEN_FAQ_QUESTIONS.has(normalizeFaqLookup(candidate))
  );
};

const Help = () => {
  const { t, language } = useLanguage();
  const [form, setForm] = useState({
    full_name: "",
    position: "",
    province: "",
    district: "",
    complaint_type: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const supportPhone = "+94 74 291 2929";
  const supportEmail = "ricevisionlanka@gmail.com";
  /* ---------------- FETCH FAQS ---------------- */

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const data = await fetchFaqs();
        const filteredFaqs = Array.isArray(data)
          ? data.filter((faq) => !shouldHideFaq(faq))
          : [];
        setFaqs(filteredFaqs);
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      } finally {
        setFaqLoading(false);
      }
    };

    loadFaqs();
  }, []);

  /* ---------------- HANDLE FORM ---------------- */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.message) {
      alert(t("complaintValidationRequired"));
      return;
    }

    setLoading(true);

    try {
      await submitComplaint(form);

      alert(t("complaintSubmittedSuccess"));

      setForm({
        full_name: "",
        position: "",
        province: "",
        district: "",
        complaint_type: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      alert(t("complaintSubmitFailed"));
    }

    setLoading(false);
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2.5 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 placeholder:text-white/85 font-medium";

  const getFaqFallbackText = (faq, kind) => {
    const englishQuestion =
      faq?.translations?.en?.question || faq?.question_en || faq?.question || "";
    const entry = FAQ_TRANSLATION_KEYS[normalizeFaqLookup(englishQuestion)];
    if (!entry?.[kind]) return "";

    const translated = t(entry[kind]);
    return translated && translated !== entry[kind] ? translated : "";
  };

  const getFaqText = (faq, kind) => {
    const lang = language === "si" || language === "ta" ? language : "en";
    const fallbackLocalized = getFaqFallbackText(faq, kind);
    const fallbacks = [
      faq?.translations?.[lang]?.[kind],
      faq?.translations?.en?.[kind],
      faq?.[`${kind}_${lang}`],
      faq?.[`${kind}_${lang.toUpperCase()}`],
      fallbackLocalized,
      faq?.[kind],
    ];

    const value = fallbacks.find((candidate) => typeof candidate === "string" && candidate.trim());
    return value || "";
  };

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-10 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-10 pb-20">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="flex items-center gap-2 sm:gap-3 text-xl sm:text-3xl md:text-5xl font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              <QuestionMarkCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-emerald-400" />
              {t('helpSupport')}
            </h1>
            <p className="text-white/85 text-[10px] sm:text-xs md:text-sm mt-2 font-bold uppercase tracking-[0.2em] max-w-2xl">
              {/* Optional subtitle text */}
            </p>
          </div>
        </div>

        {/* Quick Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <PhoneIcon className="w-5 h-5 text-emerald-400" />,
              title: t("quickPhoneSupportTitle"),
              desc: t("quickPhoneSupportDesc"),
              action: `${t("call")}: ${supportPhone}`,
              href: `tel:${supportPhone.replace(/\s+/g, "")}`,
              color: "emerald",
            },
            {
              icon: <EnvelopeIcon className="w-5 h-5 text-cyan-400" />,
              title: t("emailSupportTitle"),
              desc: t("emailSupportDesc"),
              action: `${t("email")}: ${supportEmail}`,
              href: `mailto:${supportEmail}?subject=RiceVision%20Support%20Request`,
              color: "cyan",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="glass glass-hover p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-white/10 shadow-xl group transition-all duration-500"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="font-black text-xl text-white tracking-tight">
                  {card.title}
                </h3>
              </div>
              <p className="text-white/85 text-sm leading-relaxed mb-6 font-medium">
                {card.desc}
              </p>
              <a
                href={card.href}
                className={`inline-flex items-center justify-center text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-all duration-300 ${idx === 0
                    ? "border-emerald-500/70 bg-emerald-400/35 text-emerald-950 hover:bg-emerald-400/45"
                    : "border-cyan-500/70 bg-cyan-400/35 text-cyan-950 hover:bg-cyan-400/45"
                  }`}
              >
                {card.action}
              </a>
            </div>
          ))}
        </div>

        {/* Main Interface: Form & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">

          {/* Complaint Console */}
          <div className="lg:col-span-3">
            <div className="glass p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl sm:rounded-2xl md:rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6 sm:space-y-8">
              <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-400" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/85">{t('submitComplaintTitle')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/85 mb-2 ml-1">{t('fullOperatorName')}</label>
                    <input name="full_name" value={form.full_name} onChange={handleChange} className={inputClass} placeholder={t('fullNameExample')} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/85 mb-2 ml-1">{t('assignedPosition')}</label>
                    <input name="position" value={form.position} onChange={handleChange} className={inputClass} placeholder={t('assignedPositionExample')} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/85 mb-2 ml-1">{t('province')}</label>
                      <input name="province" value={form.province} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/85 mb-2 ml-1">{t('district')}</label>
                      <input name="district" value={form.district} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/85 mb-2 ml-1">{t('anomalyType')}</label>
                    <select
                      name="complaint_type"
                      value={form.complaint_type}
                      onChange={handleChange}
                      className={inputClass + " appearance-none cursor-pointer"}
                    >
                      <option value="" className="bg-slate-900">{t('selectIssueType')}</option>
                      <option className="bg-slate-900">{t('issueTechnical')}</option>
                      <option className="bg-slate-900">{t('issueDataMismatch')}</option>
                      <option className="bg-slate-900">{t('issueAccountAccess')}</option>
                      <option className="bg-slate-900">{t('issueOther')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/85 mb-2 ml-1">{t('detailedMessage')}</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="6"
                  className={inputClass + " resize-none"}
                  placeholder={t('describeIssue')}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full glass bg-emerald-400/35 hover:bg-emerald-400/45 text-emerald-950 py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] border border-emerald-500/60 shadow-xl shadow-emerald-500/10 disabled:opacity-50"
              >
                {loading ? t('transmitting') : t('submitReport')}
              </button>
            </div>
          </div>

          {/* Dynamic Knowledge Base (FAQs) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-[2.5rem] border border-white/10 shadow-xl h-fit">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/85 mb-8 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {t('quickHelp')}
              </h2>

              {faqLoading && (
                <div className="flex items-center gap-3 py-10 justify-center">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-black uppercase text-white/85">{t('decryptingFaqs')}</span>
                </div>
              )}

              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`glass rounded-2xl border transition-all duration-300 ${openFaq === faq.id ? "bg-white/10 border-white/20" : "bg-white/5 border-white/5 hover:border-white/10"}`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      className="w-full flex justify-between items-center px-5 py-4 text-left font-bold text-xs md:text-sm text-white/90 group"
                    >
                      <span className="group-hover:text-white transition-colors">{getFaqText(faq, "question")}</span>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-white/85 transition-transform duration-500 ${openFaq === faq.id ? "rotate-180 text-emerald-400" : ""}`}
                      />
                    </button>
                    {openFaq === faq.id && (
                      <div className="px-5 pb-5 text-xs text-white/85 leading-relaxed font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                        {getFaqText(faq, "answer")}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Close the main grid grid-cols-1 lg:grid-cols-5 */}
        </div>

        {/* ── Legal & Policies — full-width footer bar ── */}
        <div className="glass rounded-3xl border border-white/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Label */}
            <div className="flex items-center gap-2 shrink-0">
              <DocumentTextIcon className="w-4 h-4 text-white/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Legal &amp; Policies
              </span>
            </div>

            {/* Divider (desktop) */}
            <div className="hidden sm:block w-px h-8 bg-white/10 mx-2" />

            {/* Links */}
            <div className="flex flex-wrap gap-3 flex-1">
              {[
                { label: "Privacy Policy",     to: "/privacy-policy", icon: "privacy_tip"       },
                { label: "Terms & Conditions", to: "/terms",          icon: "gavel"             },
                { label: "Return Policy",      to: "/return-policy",  icon: "assignment_return" },
              ].map(({ label, to, icon }) => (
                <Link
                  key={to}
                  to={to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 transition-all group flex-1 sm:flex-none"
                >
                  <span className="material-symbols-outlined text-[15px] text-emerald-400">
                    {icon}
                  </span>
                  <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors">
                    {label}
                  </span>
                  <span className="material-symbols-outlined text-[12px] text-white/25 group-hover:text-white/50 transition-colors ml-auto sm:ml-0">
                    open_in_new
                  </span>
                </Link>
              ))}
            </div>

            {/* Contact email (desktop only) */}
            <a
              href="mailto:support@ricevisionlanka.com"
              className="hidden lg:flex items-center gap-2 text-[10px] text-white/30 hover:text-white/60 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[14px]">mail</span>
              support@ricevisionlanka.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Help;