import { useState, useRef } from "react";
import ProfileForm from "./ProfileForm";

export default function Profile() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0.5, y: 0.5 });
  };

  return (
    <div className="min-h-screen w-full px-6 pb-2">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-6xl mx-auto glass px-12 pb-12 -mt-4 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative"
      >
        {/* Ambient Glow — mouse-responsive parallax */}
        <div
          className="absolute w-[28rem] h-[28rem] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"
          style={{
            transition: "top 0.8s cubic-bezier(0.25,0.46,0.45,0.94), right 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
            top: `${mousePos.y * 50 - 15}%`,
            right: `${(1 - mousePos.x) * 35 - 5}%`,
          }}
        />
        <div
          className="absolute w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"
          style={{
            transition: "bottom 0.8s cubic-bezier(0.25,0.46,0.45,0.94), left 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
            bottom: `${(1 - mousePos.y) * 35 - 5}%`,
            left: `${mousePos.x * 25 - 3}%`,
          }}
        />

        {/* Page Header */}
        <div className="mb-4 relative pt-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Operator Authorization
          </p>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">
            Identity Profile
          </h1>
          <p className="text-white/60 text-sm font-medium max-w-xl leading-relaxed">
            Synthesize and finalize your operator credentials within the RiceVision network.
            All modifications are recorded permanently in the regional registry.
          </p>
        </div>

        {/* Profile Form */}
        <ProfileForm />
      </div>
    </div>
  );
}