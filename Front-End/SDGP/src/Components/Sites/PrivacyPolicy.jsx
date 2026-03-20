import React from "react";
import { Link } from "react-router-dom";

const LAST_UPDATED = "19 March 2026";
const CONTACT_EMAIL = "support@ricevisionlanka.com";
const WEBSITE = "app.ricevisionlanka.com";

export default function PrivacyPolicy() {
  return (
    <PolicyShell title="Privacy Policy" lastUpdated={LAST_UPDATED}>

      <Section title="Who We Are">
        <p>
          RiceVision (<strong>{WEBSITE}</strong>) is a satellite-powered paddy field monitoring platform
          operated for Sri Lankan farmers and agricultural professionals. This Privacy Policy describes how
          we collect, use, and protect your personal data in connection with our service.
        </p>
      </Section>

      <Section title="Information We Collect">
        <p>We collect the following categories of personal data:</p>
        <ul>
          <li><strong>Account data:</strong> name, email address, and password hash when you register.</li>
          <li><strong>Field data:</strong> GeoJSON coordinates and boundary polygons of the paddy fields you draw on the map.</li>
          <li><strong>Payment data:</strong> transaction reference IDs returned by PayHere (we do not store card numbers or bank details — these are handled entirely by PayHere).</li>
          <li><strong>Usage data:</strong> pages visited, features used, browser type, and approximate IP location (for security and analytics).</li>
          <li><strong>Communications:</strong> messages you send via our in-app chat or support forms.</li>
        </ul>
      </Section>

      <Section title="How We Use Your Data">
        <ul>
          <li>To provide and maintain the RiceVision monitoring service.</li>
          <li>To send transactional emails (account confirmation, password reset, payment receipts).</li>
          <li>To generate satellite-derived insights (NDVI, disease alerts, yield estimates) for your field.</li>
          <li>To improve our platform through aggregated, anonymised analytics.</li>
          <li>To comply with legal obligations and enforce our Terms &amp; Conditions.</li>
        </ul>
        <p>We do <strong>not</strong> sell your personal data to third parties.</p>
      </Section>

      <Section title="Data Storage & Security">
        <p>
          Your data is stored on <strong>Supabase</strong> servers, which are hosted on AWS in a region
          compliant with industry-standard security practices. Field boundaries are encrypted at rest.
          All data transfer between your browser and our servers is encrypted via TLS/SSL.
        </p>
        <p>
          We retain your account data for as long as your account is active. Upon account deletion,
          all personal data is purged within 30 days, except where required for legal compliance.
        </p>
      </Section>

      <Section title="Third-Party Services">
        <p>We use the following third-party services that may process your data:</p>
        <ul>
          <li><strong>PayHere</strong> (payment processing) — governed by <a href="https://www.payhere.lk/privacy-policy" target="_blank" rel="noopener noreferrer">PayHere's Privacy Policy</a>.</li>
          <li><strong>Supabase</strong> (database &amp; authentication) — governed by <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase's Privacy Policy</a>.</li>
          <li><strong>Google Gemini AI</strong> (in-app chatbot) — queries are processed by Google's API. We do not link chat content to your identity.</li>
          <li><strong>Open-Meteo</strong> (weather data) — a public API. No personal data is shared.</li>
        </ul>
      </Section>

      <Section title="Cookies">
        <p>
          We use essential session cookies only — no advertising or tracking cookies. Your browser's
          local storage may retain an authentication token to keep you signed in. You can clear this
          at any time from your browser settings.
        </p>
      </Section>

      <Section title="Your Rights">
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
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 hover:underline">{CONTACT_EMAIL}</a>.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of material changes by
          email or via an in-app notification. Continued use of RiceVision after changes are posted
          constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy? Contact our Privacy Team at{" "}
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

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">{title}</h1>
          <p className="text-white/40 text-sm">Last updated: {lastUpdated} · {WEBSITE}</p>
        </div>
        <div className="h-px bg-white/10 mb-10" />
        <div className="space-y-10">{children}</div>
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
      <div className="text-white/70 text-sm leading-relaxed space-y-3 pl-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-emerald-400 [&_strong]:text-white">
        {children}
      </div>
    </section>
  );
}
