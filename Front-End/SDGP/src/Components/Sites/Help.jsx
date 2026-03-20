import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { fetchFaqs, submitComplaint } from "../../api/api";
import { useLanguage } from "../../context/LanguageContext";

/* ─────────────────────────────────────────────
   Inline policy content (no page navigation)
───────────────────────────────────────────── */
const CONTACT_EMAIL = "support@ricevisionlanka.com";
const WEBSITE = "app.ricevisionlanka.com";
const LAST_UPDATED = "19 March 2026";

function PolicySection({ title, children }) {
  return (
    <section>
      <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block" />
        {title}
      </h2>
      <div className="text-white/70 text-sm leading-relaxed space-y-3 pl-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_a]:text-emerald-400 [&_strong]:text-white">
        {children}
      </div>
    </section>
  );
}

const POLICIES = {
  privacy: {
    title: "Privacy Policy",
    content: (
      <div className="space-y-10">
        <PolicySection title="Who We Are">
          <p>
            RiceVision (<strong>{WEBSITE}</strong>) is a satellite-powered paddy field monitoring platform
            operated for Sri Lankan farmers and agricultural professionals. This Privacy Policy describes how
            we collect, use, and protect your personal data in connection with our service.
          </p>
        </PolicySection>
        <PolicySection title="Information We Collect">
          <p>We collect the following categories of personal data:</p>
          <ul>
            <li><strong>Account data:</strong> name, email address, and password hash when you register.</li>
            <li><strong>Field data:</strong> GeoJSON coordinates and boundary polygons of the paddy fields you draw on the map.</li>
            <li><strong>Payment data:</strong> transaction reference IDs returned by PayHere (we do not store card numbers or bank details — these are handled entirely by PayHere).</li>
            <li><strong>Usage data:</strong> pages visited, features used, browser type, and approximate IP location (for security and analytics).</li>
            <li><strong>Communications:</strong> messages you send via our in-app chat or support forms.</li>
          </ul>
        </PolicySection>
        <PolicySection title="How We Use Your Data">
          <ul>
            <li>To provide and maintain the RiceVision monitoring service.</li>
            <li>To send transactional emails (account confirmation, password reset, payment receipts).</li>
            <li>To generate satellite-derived insights (NDVI, disease alerts, yield estimates) for your field.</li>
            <li>To improve our platform through aggregated, anonymised analytics.</li>
            <li>To comply with legal obligations and enforce our Terms &amp; Conditions.</li>
          </ul>
          <p>We do <strong>not</strong> sell your personal data to third parties.</p>
        </PolicySection>
        <PolicySection title="Data Storage & Security">
          <p>
            Your data is stored on <strong>Supabase</strong> servers, which are hosted on AWS in a region
            compliant with industry-standard security practices. Field boundaries are encrypted at rest.
            All data transfer between your browser and our servers is encrypted via TLS/SSL.
          </p>
          <p>
            We retain your account data for as long as your account is active. Upon account deletion,
            all personal data is purged within 30 days, except where required for legal compliance.
          </p>
        </PolicySection>
        <PolicySection title="Third-Party Services">
          <p>We use the following third-party services that may process your data:</p>
          <ul>
            <li><strong>PayHere</strong> (payment processing) — governed by <a href="https://www.payhere.lk/privacy-policy" target="_blank" rel="noopener noreferrer">PayHere's Privacy Policy</a>.</li>
            <li><strong>Supabase</strong> (database &amp; authentication) — governed by <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase's Privacy Policy</a>.</li>
            <li><strong>Google Gemini AI</strong> (in-app chatbot) — queries are processed by Google's API. We do not link chat content to your identity.</li>
            <li><strong>Open-Meteo</strong> (weather data) — a public API. No personal data is shared.</li>
          </ul>
        </PolicySection>
        <PolicySection title="Cookies">
          <p>
            We use essential session cookies only — no advertising or tracking cookies. Your browser's
            local storage may retain an authentication token to keep you signed in. You can clear this
            at any time from your browser settings.
          </p>
        </PolicySection>
        <PolicySection title="Your Rights">
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> a copy of the personal data we hold about you.</li>
            <li><strong>Correct</strong> any inaccurate information from your Profile page.</li>
            <li><strong>Delete</strong> your account and all associated data.</li>
            <li><strong>Object</strong> to certain processing activities.</li>
            <li><strong>Data portability</strong> — export your field data as GeoJSON from the app.</li>
          </ul>
          <p>
            To exercise any of these rights, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </PolicySection>
        <PolicySection title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by
            email or via an in-app notification. Continued use of RiceVision after changes are posted
            constitutes acceptance of the updated policy.
          </p>
        </PolicySection>
        <PolicySection title="Contact">
          <p>
            Questions about this policy? Contact our Privacy Team at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </PolicySection>
      </div>
    ),
  },
  terms: {
    title: "Terms & Conditions",
    content: (
      <div className="space-y-10">
        <PolicySection title="Acceptance of Terms">
          <p>
            By creating an account or using any part of the RiceVision service at <strong>{WEBSITE}</strong>,
            you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use
            our service.
          </p>
        </PolicySection>
        <PolicySection title="Description of Service">
          <p>RiceVision provides satellite-powered monitoring of paddy fields in Sri Lanka. Features include:</p>
          <ul>
            <li>NDVI / EVI vegetation health analysis via Sentinel-2 imagery.</li>
            <li>Automated disease and pest outbreak alerts.</li>
            <li>Weather forecasts and historical weather data.</li>
            <li>AI-based yield prediction and field reports.</li>
            <li>In-app AI chatbot (powered by Google Gemini).</li>
          </ul>
          <p>We reserve the right to modify, suspend, or discontinue features of the service at any time with reasonable notice.</p>
        </PolicySection>
        <PolicySection title="Eligibility">
          <p>
            You must be at least <strong>18 years old</strong> and be a registered user to access the
            platform. By using RiceVision you represent that all information provided is accurate and up to date.
          </p>
        </PolicySection>
        <PolicySection title="User Accounts">
          <ul>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>Immediately notify us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if you suspect unauthorised access to your account.</li>
            <li>You may not share your account with other individuals.</li>
            <li>We reserve the right to suspend or terminate accounts found in violation of these terms.</li>
          </ul>
        </PolicySection>
        <PolicySection title="Subscriptions & Payments">
          <p>
            RiceVision operates on a monthly subscription model billed in Sri Lankan Rupees (LKR) through
            PayHere. Subscription fees are charged at the start of each billing cycle. By subscribing you
            authorise us to charge your selected payment method on a recurring basis.
          </p>
          <p>
            All payments are processed by PayHere and are subject to PayHere's own terms. We do not store
            your card or bank details. For refund eligibility, refer to our Return Policy.
          </p>
        </PolicySection>
        <PolicySection title="Acceptable Use">
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any unlawful purpose or in violation of Sri Lankan law.</li>
            <li>Attempt to gain unauthorised access to any part of the platform or its underlying infrastructure.</li>
            <li>Scrape, copy, or redistribute satellite imagery or data products provided by RiceVision.</li>
            <li>Upload content that is harmful, defamatory, or infringes third-party rights.</li>
            <li>Reverse-engineer or decompile any part of the RiceVision software.</li>
          </ul>
        </PolicySection>
        <PolicySection title="Intellectual Property">
          <p>
            All content, software, algorithms, and data products on RiceVision — including NDVI indices,
            yield models, and report templates — are the intellectual property of RiceVision or its licensors.
            You are granted a limited, non-exclusive, non-transferable licence to access and use these for
            your own agricultural purposes only.
          </p>
          <p>
            Field boundary data (GeoJSON) that you create remains yours. By submitting field data, you
            grant RiceVision a licence to process it solely to deliver the service.
          </p>
        </PolicySection>
        <PolicySection title="Data Accuracy & Disclaimer">
          <p>
            Satellite-derived indices (NDVI, EVI) and AI-generated predictions are tools to support
            decision-making — they are not a substitute for professional agronomic advice. RiceVision does
            not guarantee the accuracy of yield predictions, disease alerts, or weather forecasts.
          </p>
          <p>
            We are not liable for crop losses, financial decisions, or any damage arising from reliance on
            information provided by the platform.
          </p>
        </PolicySection>
        <PolicySection title="Limitation of Liability">
          <p>
            To the fullest extent permitted by Sri Lankan law, RiceVision and its team shall not be liable
            for any indirect, incidental, special, or consequential damages arising from your use of the
            service. Our total liability shall not exceed the amount you paid in the three months preceding
            the claim.
          </p>
        </PolicySection>
        <PolicySection title="Governing Law">
          <p>
            These Terms are governed by the laws of Sri Lanka. Any disputes shall be subject to the
            exclusive jurisdiction of the courts of Sri Lanka.
          </p>
        </PolicySection>
        <PolicySection title="Changes to These Terms">
          <p>
            We may revise these Terms at any time. We will give at least <strong>14 days' notice</strong>{" "}
            before material changes take effect via email or in-app notification. Continued use of
            RiceVision after the effective date constitutes acceptance of the updated Terms.
          </p>
        </PolicySection>
        <PolicySection title="Contact">
          <p>
            For questions about these Terms, contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </PolicySection>
      </div>
    ),
  },
  return: {
    title: "Return Policy",
    content: (
      <div className="space-y-10">
        <PolicySection title="Overview">
          <p>
            RiceVision offers subscription-based satellite monitoring services for paddy fields in Sri Lanka.
            Because our service is digital and access to monitoring data begins immediately upon payment, all
            sales are generally final. Please read this policy carefully before subscribing.
          </p>
        </PolicySection>
        <PolicySection title="Eligibility for Refunds">
          <p>You may be entitled to a full refund if:</p>
          <ul>
            <li>You were charged in error (e.g. duplicate billing).</li>
            <li>A technical failure on our side prevented you from accessing the service for more than <strong>7 consecutive days</strong> within a billing cycle, and the issue was reported to our support team.</li>
            <li>Your subscription was renewed automatically while you had a pending cancellation request that was submitted before the renewal date.</li>
          </ul>
          <p>Refunds are <strong>not</strong> provided for:</p>
          <ul>
            <li>Change of mind after payment.</li>
            <li>Partial months — we do not prorate unused days.</li>
            <li>Disruptions caused by third-party services (satellite data providers, internet outages, etc.).</li>
            <li>Accounts suspended due to violation of our Terms &amp; Conditions.</li>
          </ul>
        </PolicySection>
        <PolicySection title="How to Request a Refund">
          <p>
            To request a refund, send an email to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
            within <strong>14 days</strong> of the charge date with:
          </p>
          <ol>
            <li>Your registered email address.</li>
            <li>PayHere order ID or transaction reference.</li>
            <li>A brief description of the issue.</li>
          </ol>
          <p>
            We will review your request within <strong>5 working days</strong> and notify you of the outcome.
            Approved refunds will be credited to the original payment method within 7–14 business days, subject
            to PayHere's processing times.
          </p>
        </PolicySection>
        <PolicySection title="Cancellation">
          <p>
            You may cancel your subscription at any time from your Account Profile page. Cancellation takes
            effect at the end of the current billing cycle. You will retain access to all features until then.
          </p>
        </PolicySection>
        <PolicySection title="Contact Us">
          <p>
            For any questions regarding this policy, please contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </PolicySection>
      </div>
    ),
  },
};

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
  const [activePolicy, setActivePolicy] = useState(null);

  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const supportPhone = "+94 74 291 2929";
  const supportEmail = "ricevisionlanka@gmail.com";

  // Close overlay with Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setActivePolicy(null);
  }, []);
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
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

            {/* Buttons — open overlay instead of navigating away */}
            <div className="flex flex-wrap gap-3 flex-1">
              {[
                { label: "Privacy Policy",     key: "privacy", icon: "privacy_tip"       },
                { label: "Terms & Conditions", key: "terms",   icon: "gavel"             },
                { label: "Return Policy",      key: "return",  icon: "assignment_return" },
              ].map(({ label, key, icon }) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActivePolicy(key)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 transition-all group flex-1 sm:flex-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px] text-emerald-400">
                    {icon}
                  </span>
                  <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors">
                    {label}
                  </span>
                </button>
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

        {/* ── Policy Overlay Modal ── */}
        {activePolicy && (
          <div
            className="fixed inset-x-0 bottom-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            style={{ top: "60px", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setActivePolicy(null); }}
          >
            <div
              className="relative w-full sm:max-w-2xl max-h-[78dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-white/20 shadow-2xl backdrop-blur-2xl"
              style={{ background: "rgba(10,20,38,0.45)" }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-black tracking-tight text-white">
                    {POLICIES[activePolicy].title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePolicy(null)}
                  aria-label="Close"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              {/* Updated line */}
              <p className="px-6 py-2 text-[10px] text-white/30 shrink-0">
                Last updated: {LAST_UPDATED} · {WEBSITE}
              </p>
              {/* Scrollable content */}
              <div className="overflow-y-auto px-6 pb-8 flex-1">
                {POLICIES[activePolicy].content}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Help;