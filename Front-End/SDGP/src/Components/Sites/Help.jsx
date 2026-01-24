import React, { useState, useEffect } from "react";
import {
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../../supabaseClient";

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

  // FAQ state
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  // Fetch FAQs from DB
  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from("faq")
        .select("id, question, answer")
        .order("created_at", { ascending: true });

      if (!error) {
        setFaqs(data || []);
      }

      setFaqLoading(false);
    };

    fetchFaqs();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.message) {
      alert("Full name and complaint are required");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      user_id: user?.id || null,
      full_name: form.full_name,
      position: form.position || null,
      province: form.province || null,
      district: form.district || null,
      complaint_type: form.complaint_type,
      message: form.message,
      is_anonymous: !user,
    };

    const { error } = await supabase.from("complains").insert([payload]);

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert(
        user
          ? "Complaint submitted successfully"
          : "Complaint submitted anonymously"
      );
      setForm({
        full_name: "",
        position: "",
        province: "",
        district: "",
        complaint_type: "",
        message: "",
      });
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            <QuestionMarkCircleIcon className="w-8 h-8" />
            Help & Support
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-3xl">
            Find answers to common questions or submit a complaint to our
            support team. We’re here to help you.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <PhoneIcon className="w-5 h-5" />,
              title: "Contact Support",
              desc: "Reach out to our team for urgent issues or direct assistance.",
            },
            {
              icon: <EnvelopeIcon className="w-5 h-5" />,
              title: "Email Assistance",
              desc: "Send detailed queries and we’ll respond as soon as possible.",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm p-6"
            >
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                {card.icon}
                {card.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Complaint Section */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm p-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            <ExclamationTriangleIcon className="w-6 h-6" />
            Submit a Complaint
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {[
                { label: "Full Name", name: "full_name" },
                { label: "Position", name: "position" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                {["province", "district"].map((name) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1 capitalize text-gray-700 dark:text-gray-300">
                      {name}
                    </label>
                    <input
                      type="text"
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Complaint Type
                </label>
                <select
                  name="complaint_type"
                  value={form.complaint_type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select a type</option>
                  <option>Technical Issue</option>
                  <option>Data Error</option>
                  <option>Account Issue</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
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
                className="mt-5 bg-black dark:bg-gray-100 text-white dark:text-black py-3 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Frequently Asked Questions
          </h2>

          {faqLoading && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Loading FAQs...
            </p>
          )}

          {!faqLoading && faqs.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No FAQs available.
            </p>
          )}

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 dark:border-neutral-700 rounded-lg"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
                >
                  {faq.question}
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform ${
                      openFaq === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFaq === faq.id && (
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
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
