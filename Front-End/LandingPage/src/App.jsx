import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";
import Info from "./Components/Info";
import Mission from "./Components/Mission";
import Goals from "./Components/Goals";
import Features from "./Components/Features";
import Contact from "./Components/Contact";
import Footer from "./Components/Footer";
import AuthModal from "./Components/AuthModal";
import SplashScreen from "./Components/SplashScreen";
import Team from "./Components/Team";
import Building from "./Components/Building";

function App() {
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

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
            <Navbar onOpenRegister={() => setAuthOpen(true)} />

            {/* MAIN CONTENT */}
            <main className="flex-1">
              <Hero />
              <Info />
              <Mission onOpenRegister={() => setAuthOpen(true)} />
              <Goals />
              <Features />
              <Team />
              <Contact />
            </main>

            <Footer />

            <AuthModal
              isOpen={authOpen}
              onClose={() => setAuthOpen(false)}
            />
          </div>
        }
      />

      {/* BUILDING PAGE — NO NAVBAR, NO FOOTER */}
      <Route path="/building" element={<Building />} />
    </Routes>
  );
}

export default App;