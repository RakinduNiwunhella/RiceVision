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
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
                <div className="w-[min(92vw,420px)] rounded-2xl border border-emerald-200/20 bg-white/10 p-8 text-center text-white shadow-2xl">
                  <div className="mx-auto mb-5 h-14 w-14 rounded-full border border-emerald-300/40 bg-emerald-300/15 rv-redirect-pulse" />
                  <h3 className="text-xl font-semibold tracking-wide">Preparing RiceVision</h3>
                  <p className="mt-2 text-sm text-emerald-100/90">
                    Redirecting you to the sign-in page...
                  </p>
                  <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-full origin-left rounded-full bg-emerald-300 rv-redirect-progress" />
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