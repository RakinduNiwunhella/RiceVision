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
    "w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none transition";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 px-6 py-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 space-y-12">

        {/* Header */}

        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900 dark:text-white">
            <QuestionMarkCircleIcon className="w-8 h-8" />
            Help & Support
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
            Find answers to common questions or submit a complaint to our
            support team.
          </p>
        </div>

        {/* CONTACT INFO */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <PhoneIcon className="w-5 h-5" />,
              title: "Contact Support",
              desc: "Reach out to our support team for urgent assistance.",
            },
            {
              icon: <EnvelopeIcon className="w-5 h-5" />,
              title: "Email Assistance",
              desc: "Send us detailed questions and we will reply soon.",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6"
            >
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-slate-900 dark:text-white">
                {card.icon}
                {card.title}
              </h3>

              <p className="text-slate-700 dark:text-slate-300 text-sm">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* COMPLAINT FORM */}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">

          <h2 className="flex items-center gap-2 text-xl font-semibold mb-6 text-slate-900 dark:text-white">
            <ExclamationTriangleIcon className="w-6 h-6" />
            Submit a Complaint
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-5">

              <div>
                <label className="block text-sm mb-1 text-slate-500">
                  Full Name
                </label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-500">
                  Position
                </label>
                <input
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm mb-1 text-slate-500">
                    Province
                  </label>

                  <input
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-slate-500">
                    District
                  </label>

                  <input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-500">
                  Complaint Type
                </label>

                <select
                  name="complaint_type"
                  value={form.complaint_type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select type</option>
                  <option>Technical Issue</option>
                  <option>Data Error</option>
                  <option>Account Issue</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">

              <label className="block text-sm mb-1 text-slate-500">
                Complaint Description
              </label>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="8"
                className={inputClass + " resize-none"}
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-md transition disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>

            </div>
          </div>
        </div>

        {/* FAQ SECTION */}

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">

          <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>

          {faqLoading && <p>Loading FAQs...</p>}

          {!faqLoading && faqs.length === 0 && (
            <p>No FAQs available.</p>
          )}

          <div className="space-y-3">

            {faqs.map((faq) => (

              <div
                key={faq.id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg"
              >

                <button
                  onClick={() =>
                    setOpenFaq(openFaq === faq.id ? null : faq.id)
                  }
                  className="w-full flex justify-between px-4 py-3 text-left"
                >
                  {faq.question}

                  <ChevronDownIcon
                    className={`w-5 h-5 transition ${
                      openFaq === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFaq === faq.id && (
                  <div className="px-4 pb-4 text-sm text-slate-700 dark:text-slate-300">
                    {faq.answer}
                  </div>
                )}
              </div>

            ))}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Help;