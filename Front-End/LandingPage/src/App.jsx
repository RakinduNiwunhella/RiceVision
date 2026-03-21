import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import Info from "./Components/Info";
import Mission from "./Components/Mission";
import Goals from "./Components/Goals";
import Features from "./Components/Features";
import Contact from "./Components/Contact";
import Footer from "./Components/Footer";
import SplashScreen from "./Components/SplashScreen";
import Team from "./Components/Team";
import Building from "./Components/Building";

const getSigninRedirectUrl = () => {
  const fromEnv = import.meta.env.VITE_RICEVISION_SIGNIN_URL;

  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }

  return "https://app.ricevisionlanka.com/signin";
};

function App() {
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isRedirecting) return undefined;

    const timeoutId = window.setTimeout(() => {
      window.location.assign(getSigninRedirectUrl());
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [isRedirecting]);

  const handleGetStarted = () => {
    setIsRedirecting(true);
  };

  // Splash screen
  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <Routes>
      {/* HOME PAGE — WITH NAVBAR & FOOTER */}
      <Route
        path="/"
        element={
          <div className="min-h-screen flex flex-col">
            <Navbar onOpenRegister={handleGetStarted} />

            {/* MAIN CONTENT */}
            <main className="flex-1">
              <Hero />
              <Info />
              <Mission onOpenRegister={handleGetStarted} />
              <Goals />
              <Features />
              <Team />
              <Contact />
            </main>

            <Footer />

            {isRedirecting && (
              <div className="fixed inset-0 z-60 flex items-center justify-center overflow-hidden bg-slate-950/85 backdrop-blur-md">
                <div className="pointer-events-none absolute -left-16 top-12 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl rv-redirect-float" />
                <div className="pointer-events-none absolute -right-12 bottom-8 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl rv-redirect-float-delayed" />

                <div className="flex w-[min(92vw,460px)] flex-col items-center">
                  <img
                    src="/images/Logo-RiceVision.webp"
                    alt="RiceVision"
                    className="mb-5 h-20 w-20 object-contain drop-shadow-[0_8px_24px_rgba(16,185,129,0.55)] md:h-24 md:w-24"
                  />

                  <div className="relative w-full overflow-hidden rounded-3xl border border-white/20 bg-slate-900/65 p-8 text-center text-white shadow-[0_30px_90px_rgba(10,20,30,0.55)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-emerald-300/90 to-transparent rv-redirect-shimmer" />

                    <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-200/85">Secure handoff</p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight">Preparing RiceVision</h3>
                    <p className="mt-2 text-sm text-slate-200/90">
                      Taking you to the sign-in portal with your session context.
                    </p>

                    <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-full origin-left rounded-full bg-linear-to-r from-emerald-300 via-cyan-300 to-emerald-200 rv-redirect-progress" />
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-1.5 text-emerald-100/85">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 rv-redirect-dot-1" />
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 rv-redirect-dot-2" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-100 rv-redirect-dot-3" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* BUILDING PAGE — NO NAVBAR, NO FOOTER */}
      <Route path="/building" element={<Building />} />
    </Routes>
  );
}

export default App;