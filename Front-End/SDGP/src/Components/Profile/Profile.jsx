import { useState, useRef, useMemo } from "react";
import ProfileForm from "./ProfileForm";
import MyFieldTab from "./MyFieldTab";
import { useLanguage } from "../../context/LanguageContext";
import TutorialTooltip from "../../components/TutorialTooltip";
import { usePageTutorial } from "../../hooks/usePageTutorial";

export default function Profile() {
  const { t } = useLanguage();

  // Tutorial setup
  const tutorialSteps = useMemo(() => [
    {
      title: "Your Profile",
      action: "Manage your identity information and paddy field details",
      outcome: "Two tabs: Identity Profile for personal info, My Paddy Field for field details",
    },
    {
      title: "Identity Profile",
      action: "Click the Identity Profile tab to update your account information",
      outcome: "Edit your name, email, contact details, and other personal information",
    },
    {
      title: "My Paddy Field",
      action: "Click My Paddy Field tab to view and manage your field data",
      outcome: "See your registered paddy field size, location, and other field-related details",
    },
  ], [])

  const { currentStep, showTutorial, currentTutorialStep, nextStep, prevStep, closeTutorial } =
    usePageTutorial("profile", tutorialSteps)

  const headerRef = useRef(null)
  const tabSwitcherRef = useRef(null)
  const contentRef = useRef(null)

  const TABS = [
    { id: "identity", labelKey: "identityProfile", icon: "verified_user" },
    { id: "field",    labelKey: "myPaddyField",    icon: "landscape"     },
  ];
  const [activeTab, setActiveTab] = useState("identity");
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
    <div className="w-full px-2 sm:px-4 md:px-6 pb-6 sm:pb-10">

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-6xl mx-auto glass px-4 sm:px-8 md:px-12 pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 md:pb-12 rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative"
      >
        {/* Ambient glow */}
        <div
          className="absolute w-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"
          style={{
            transition:
              "bottom 0.8s cubic-bezier(0.25,0.46,0.45,0.94), left 0.8s cubic-bezier(0.25,0.46,0.45,0.94)",
            bottom: `${(1 - mousePos.y) * 35 - 5}%`,
            left:   `${mousePos.x * 25 - 3}%`,
          }}
        />

        {/* Header */}
        <div ref={headerRef} className="mb-8 relative">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            {t('operatorAuth')}
          </p>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter uppercase mb-3 sm:mb-4">
            {activeTab === "identity" ? t('identityProfile') : t('myPaddyField')}
          </h1>

          <p className="text-white/60 text-sm font-medium max-w-xl leading-relaxed">
            {activeTab === "identity"
              ? t('profileDesc')
              : t('paddyFieldDesc')}
          </p>
        </div>

        {/* Tab switcher */}
        <div ref={tabSwitcherRef} className="flex gap-2 mb-6 sm:mb-8 relative overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10"
                  : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {t(tab.labelKey)}
            </button>
          ))}
          {/* Active tab bottom line indicator */}
          <span className="absolute -bottom-3 left-0 right-0 h-px bg-white/5" />
        </div>

        {/* Tab content */}
        <div ref={contentRef}>
          {activeTab === "identity" && <ProfileForm />}
          {activeTab === "field"    && <MyFieldTab />}
        </div>

        {/* Tutorial Tooltips */}
        {showTutorial && currentTutorialStep && (
          <>
            {currentStep === 0 && (
              <TutorialTooltip
                visible={true}
                position="bottom"
                title={currentTutorialStep.title}
                action={currentTutorialStep.action}
                outcome={currentTutorialStep.outcome}
                elementRef={headerRef}
                step={currentStep}
                totalSteps={tutorialSteps.length}
                onNext={nextStep}
                onPrevious={prevStep}
                onDismiss={closeTutorial}
              />
            )}
            {currentStep === 1 && (
              <TutorialTooltip
               visible={true}
                position="bottom"
                title={currentTutorialStep.title}
                action={currentTutorialStep.action}
                outcome={currentTutorialStep.outcome}
                elementRef={tabSwitcherRef}
                step={currentStep}
                totalSteps={tutorialSteps.length}
                onNext={nextStep}
                onPrevious={prevStep}
                onDismiss={closeTutorial}
              />
            )}
            {currentStep === 2 && (
              <TutorialTooltip
                visible={true}
                position="top"
                title={currentTutorialStep.title}
                action={currentTutorialStep.action}
                outcome={currentTutorialStep.outcome}
                elementRef={contentRef}
                step={currentStep}
                totalSteps={tutorialSteps.length}
                onNext={nextStep}
                onPrevious={prevStep}
                onDismiss={closeTutorial}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}