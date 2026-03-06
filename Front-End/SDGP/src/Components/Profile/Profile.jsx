import ProfileForm from "./ProfileForm";

export default function Profile() {
  return (
    <div className="min-h-screen w-full px-6 pb-28">
      <div className="w-full max-w-6xl mx-auto glass px-12 pb-12 pt-0 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative group">

        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Page Header */}
        <div className="mb-4 relative">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Operator Authorization
          </p>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">
            Identity Profile
          </h1>
          <p className="text-white/40 text-sm font-medium max-w-xl">
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