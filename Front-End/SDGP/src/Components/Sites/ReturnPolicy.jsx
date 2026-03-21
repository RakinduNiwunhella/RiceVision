import React from "react";
import { Link } from "react-router-dom";

const LAST_UPDATED = "19 March 2026";
const CONTACT_EMAIL = "support@ricevisionlanka.com";
const WEBSITE = "app.ricevisionlanka.com";

export default function ReturnPolicy() {
  return (
    <PolicyShell title="Return Policy" lastUpdated={LAST_UPDATED}>

      <Section title="Overview">
        <p>
          RiceVision offers subscription-based satellite monitoring services for paddy fields in Sri Lanka.
          Because our service is digital and access to monitoring data begins immediately upon payment, all
          sales are generally final. Please read this policy carefully before subscribing.
        </p>
      </Section>

      <Section title="Eligibility for Refunds">
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
      </Section>

      <Section title="How to Request a Refund">
        <p>
          To request a refund, send an email to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">{CONTACT_EMAIL}</a>{" "}
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
      </Section>

      <Section title="Cancellation">
        <p>
          You may cancel your subscription at any time from your Account Profile page. Cancellation takes
          effect at the end of the current billing cycle. You will retain access to all features until then.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          For any questions regarding this policy, please contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">{CONTACT_EMAIL}</a>.
        </p>
      </Section>

    </PolicyShell>
  );
}

/* ── Shared sub-components ── */
function PolicyShell({ title, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950/30 text-white">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logoSDGP.webp" alt="RiceVision" className="h-8 w-auto" />

          </Link>
          <Link
            to="/dashboard"
            className="text-xs text-white/50 hover:text-white/80 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to app
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">{title}</h1>
          <p className="text-white/40 text-sm">Last updated: {lastUpdated} · {WEBSITE}</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-10" />

        {/* Policy body */}
        <div className="space-y-10 prose-policy">
          {children}
        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-5 text-xs text-white/40">
          <Link to="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white/70 transition-colors">Terms &amp; Conditions</Link>
          <Link to="/returns" className="hover:text-white/70 transition-colors">Return Policy</Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white/70 transition-colors ml-auto">{CONTACT_EMAIL}</a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
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
