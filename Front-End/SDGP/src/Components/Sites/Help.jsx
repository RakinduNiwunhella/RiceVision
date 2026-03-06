import React, { useState, useEffect } from "react";
import {
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import { fetchFaqs, submitComplaint } from "../../api/api";

const Help = () => {
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

  /* ---------------- FETCH FAQS ---------------- */

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const data = await fetchFaqs();
        setFaqs(data);
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
      alert("Full name and complaint message are required");
      return;
    }

    setLoading(true);

    try {
      await submitComplaint(form);

      alert("Complaint submitted successfully");

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
      alert("Failed to submit complaint");
    }

    setLoading(false);
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2.5 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 placeholder:text-white/20 font-medium";

  return (
    <div className="min-h-full p-6 lg:p-10 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-10 pb-20">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="flex items-center gap-3 text-3xl md:text-5xl font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              <QuestionMarkCircleIcon className="w-8 h-8 md:w-12 md:h-12 text-emerald-400" />
              Help & Support
            </h1>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-sm mt-2 font-bold uppercase tracking-[0.2em] max-w-2xl">
              Knowledge Base & Centralized Concierge — Find answers or synchronize with our intelligence team.
            </p>
          </div>
        </div>

        {/* Quick Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <PhoneIcon className="w-5 h-5 text-emerald-400" />,
              title: "Rapid Response Support",
              desc: "Immediate tactical assistance for critical infrastructure failures.",
              action: "Dial Concierge",
              color: "emerald"
            },
            {
              icon: <EnvelopeIcon className="w-5 h-5 text-cyan-400" />,
              title: "Strategic Inquiry",
              desc: "Submit non-urgent data requests or detailed system feedback.",
              action: "Transmit Email",
              color: "cyan"
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="glass glass-hover p-8 rounded-[2rem] border border-white/10 shadow-xl group transition-all duration-500"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="font-black text-xl text-white tracking-tight">
                  {card.title}
                </h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-6 font-medium">
                {card.desc}
              </p>
              <button className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 glass rounded-lg border-white/10 hover:bg-white/5 transition-colors ${idx === 0 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {card.action}
              </button>
            </div>
          ))}
        </div>

        {/* Main Interface: Form & FAQs */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">

          {/* Complaint Console */}
          <div className="xl:col-span-3">
            <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
              <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-400" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Intelligence Feedback Loop</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 ml-1">Full Operator Name</label>
                    <input name="full_name" value={form.full_name} onChange={handleChange} className={inputClass} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 ml-1">Assigned Position</label>
                    <input name="position" value={form.position} onChange={handleChange} className={inputClass} placeholder="Field Supervisor" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 ml-1">Province</label>
                      <input name="province" value={form.province} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 ml-1">District</label>
                      <input name="district" value={form.district} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 ml-1">Anomaly Type</label>
                    <select
                      name="complaint_type"
                      value={form.complaint_type}
                      onChange={handleChange}
                      className={inputClass + " appearance-none cursor-pointer"}
                    >
                      <option value="" className="bg-slate-900">Select Severity</option>
                      <option className="bg-slate-900">Technical Intelligence Failure</option>
                      <option className="bg-slate-900">Spectral Data Inconsistency</option>
                      <option className="bg-slate-900">Credential Access Hub Issue</option>
                      <option className="bg-slate-900">Other Diagnostic Required</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 ml-1">Detailed Diagnostic Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="6"
                  className={inputClass + " resize-none"}
                  placeholder="Describe the spectral anomaly or system behavior..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full glass bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] border border-emerald-500/30 shadow-xl shadow-emerald-500/10 disabled:opacity-50"
              >
                {loading ? "Transmitting..." : "Synchronize Complaint"}
              </button>
            </div>
          </div>

          {/* Dynamic Knowledge Base (FAQs) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-xl h-fit">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-8 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Knowledge Base Alpha
              </h2>

              {faqLoading && (
                <div className="flex items-center gap-3 py-10 justify-center">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-black uppercase text-white/20">Decrypting FAQs...</span>
                </div>
              )}

              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`glass rounded-2xl border transition-all duration-300 ${openFaq === faq.id ? "bg-white/10 border-white/20" : "bg-white/5 border-white/5 hover:border-white/10"
                      }`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      className="w-full flex justify-between items-center px-5 py-4 text-left font-bold text-xs md:text-sm text-white/80 group"
                    >
                      <span className="group-hover:text-white transition-colors">{faq.question}</span>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-white/30 transition-transform duration-500 ${openFaq === faq.id ? "rotate-180 text-emerald-400" : ""
                          }`}
                      />
                    </button>

                    {openFaq === faq.id && (
                      <div className="px-5 pb-5 text-xs text-white/40 leading-relaxed font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Support Tag */}
            <div className="glass p-6 rounded-3xl border border-white/10 text-center">
              <p className="text-[10px] font-black uppercase text-white/20 tracking-tighter">System Version Alpha-1.0.4 • RiceVision Core</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;