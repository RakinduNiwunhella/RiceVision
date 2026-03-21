import React from "react";
import { Link } from "react-router-dom";

const LAST_UPDATED = "19 March 2026";
const CONTACT_EMAIL = "support@ricevisionlanka.com";
const WEBSITE = "app.ricevisionlanka.com";

export default function TermsAndConditions() {
  return (
    <PolicyShell title="Terms &amp; Conditions" lastUpdated={LAST_UPDATED}>

      <Section title="Acceptance of Terms">
        <p>
          By creating an account or using any part of the RiceVision service at <strong>{WEBSITE}</strong>,
          you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use
          our service.
        </p>
      </Section>

      <Section title="Description of Service">
        <p>
          RiceVision provides satellite-powered monitoring of paddy fields in Sri Lanka. Features include:
        </p>
        <ul>
          <li>NDVI / EVI vegetation health analysis via Sentinel-2 imagery.</li>
          <li>Automated disease and pest outbreak alerts.</li>
          <li>Weather forecasts and historical weather data.</li>
          <li>AI-based yield prediction and field reports.</li>
          <li>In-app AI chatbot (powered by Google Gemini).</li>
        </ul>
        <p>
          We reserve the right to modify, suspend, or discontinue features of the service at any time
          with reasonable notice.
        </p>
      </Section>

      <Section title="Eligibility">
        <p>
          You must be at least <strong>18 years old</strong> and be a registered user to access the
          platform. By using RiceVision you represent that all information provided is accurate and
          up to date.
        </p>
      </Section>

      <Section title="User Accounts">
        <ul>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>Immediately notify us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if you suspect unauthorised access to your account.</li>
          <li>You may not share your account with other individuals.</li>
          <li>We reserve the right to suspend or terminate accounts found in violation of these terms.</li>
        </ul>
      </Section>

      <Section title="Subscriptions & Payments">
        <p>
          RiceVision operates on a monthly subscription model billed in Sri Lankan Rupees (LKR) through
          PayHere. Subscription fees are charged at the start of each billing cycle. By subscribing you
          authorise us to charge your selected payment method on a recurring basis.
        </p>
        <p>
          All payments are processed by PayHere and are subject to PayHere's own terms. We do not store
          your card or bank details. For refund eligibility, refer to our{" "}
          <Link to="/returns" className="text-emerald-400 hover:underline">Return Policy</Link>.
        </p>
      </Section>

      <Section title="Acceptable Use">
        <p>You agree not to:</p>
        <ul>
          <li>Use the service for any unlawful purpose or in violation of Sri Lankan law.</li>
          <li>Attempt to gain unauthorised access to any part of the platform or its underlying infrastructure.</li>
          <li>Scrape, copy, or redistribute satellite imagery or data products provided by RiceVision.</li>
          <li>Upload content that is harmful, defamatory, or infringes third-party rights.</li>
          <li>Reverse-engineer or decompile any part of the RiceVision software.</li>
        </ul>
      </Section>

      <Section title="Intellectual Property">
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
      </Section>

      <Section title="Data Accuracy & Disclaimer">
        <p>
          Satellite-derived indices (NDVI, EVI) and AI-generated predictions are tools to support
          decision-making — they are not a substitute for professional agronomic advice. RiceVision does
          not guarantee the accuracy of yield predictions, disease alerts, or weather forecasts.
        </p>
        <p>
          We are not liable for crop losses, financial decisions, or any damage arising from reliance on
          information provided by the platform.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          To the fullest extent permitted by Sri Lankan law, RiceVision and its team shall not be liable
          for any indirect, incidental, special, or consequential damages arising from your use of the
          service. Our total liability shall not exceed the amount you paid in the three months preceding
          the claim.
        </p>
      </Section>

      <Section title="Governing Law">
        <p>
          These Terms are governed by the laws of Sri Lanka. Any disputes shall be subject to the
          exclusive jurisdiction of the courts of Sri Lanka.
        </p>
      </Section>

      <Section title="Changes to These Terms">
        <p>
          We may revise these Terms at any time. We will give at least <strong>14 days' notice</strong>{" "}
          before material changes take effect via email or in-app notification. Continued use of
          RiceVision after the effective date constitutes acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For questions about these Terms, contact us at{" "}
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
          <h1
            className="text-4xl font-black tracking-tight mb-2"
            dangerouslySetInnerHTML={{ __html: title }}
          />
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
