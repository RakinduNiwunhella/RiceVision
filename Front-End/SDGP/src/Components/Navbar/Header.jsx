import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage, LANGUAGES } from "../../context/LanguageContext";
import Notifications from "../Notifications/Notifications";
import { supabase } from "../../supabaseClient";
import { usePageTutorial } from "../../hooks/usePageTutorial";
import TutorialTooltip from "../../components/TutorialTooltip";

const searchIndex = [
  {
    label: "Dashboard",
    description: "Overview, analytics, yield summary",
    icon: "apps",
    path: "/dashboard",
  },
  {
    label: "Field Data",
    description: "Rice field records, crop stage, yield data",
    icon: "table_chart",
    path: "/field-data",
  },
  {
    label: "Map",
    description: "Field map, district locations, satellite view",
    icon: "map",
    path: "/field-map",
  },
  {
    label: "Weather",
    description: "Weather forecast, rainfall, temperature",
    icon: "cloud",
    path: "/weather",
  },
  {
    label: "Alerts",
    description: "Disaster alerts, pest risks, past alerts",
    icon: "notification_important",
    path: "/alerts",
  },
  {
    label: "Report",
    description: "Analytics reports, charts, export data",
    icon: "bar_chart",
    path: "/report",
  },
  {
    label: "Help",
    description: "FAQ, documentation, support",
    icon: "help",
    path: "/help",
  },
  {
    label: "Profile",
    description: "Account settings, preferences",
    icon: "person",
    path: "/profile",
  },
];

const districts = [
  "ampara",
  "anuradhapura",
  "badulla",
  "batticaloa",
  "colombo",
  "galle",
  "gampaha",
  "hambantota",
  "jaffna",
  "kalutara",
  "kandy",
  "kegalle",
  "kilinochchi",
  "kurunegala",
  "mannar",
  "matale",
  "matara",
  "monaragala",
  "mullaitivu",
  "nuwara eliya",
  "polonnaruwa",
  "puttalam",
  "ratnapura",
  "trincomalee",
  "vavuniya",
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [langDropdownPos, setLangDropdownPos] = useState({ top: 0, right: 0 });
  const langRef = useRef(null);
  const langBtnRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tutorial refs for header buttons
  const searchInputRef = useRef(null);
  const languageBtnRef = useRef(null);
  const themeBtnRef = useRef(null);
  const notificationBtnRef = useRef(null);
  const profileBtnRef = useRef(null);

  // Tutorial setup
  const tutorialSteps = useMemo(() => t("headerTutorial") ? [
    {
      ref: searchInputRef,
      title: t("headerTutorial.search.title"),
      action: t("headerTutorial.search.action"),
      outcome: t("headerTutorial.search.outcome"),
    },
    {
      ref: languageBtnRef,
      title: t("headerTutorial.language.title"),
      action: t("headerTutorial.language.action"),
      outcome: t("headerTutorial.language.outcome"),
    },
    {
      ref: themeBtnRef,
      title: t("headerTutorial.theme.title"),
      action: t("headerTutorial.theme.action"),
      outcome: t("headerTutorial.theme.outcome"),
    },
    {
      ref: notificationBtnRef,
      title: t("headerTutorial.notifications.title"),
      action: t("headerTutorial.notifications.action"),
      outcome: t("headerTutorial.notifications.outcome"),
    },
    {
      ref: profileBtnRef,
      title: t("headerTutorial.profile.title"),
      action: t("headerTutorial.profile.action"),
      outcome: t("headerTutorial.profile.outcome"),
    },
  ] : [], [t]);

  const { showTutorial, currentTutorialStep } = usePageTutorial("Header", tutorialSteps.length);

  const updateDropdownPos = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const query = searchQuery.toLowerCase();

  let filteredResults = searchQuery.trim()
    ? searchIndex.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      )
    : [];

  // Add district results dynamically
  const matchedDistricts = districts
    .filter((d) =>
      d.toLowerCase().replace(/\s+/g, "").includes(query.replace(/\s+/g, "")),
    )
    .map((d) => ({
      label: d
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      description: "District analytics and field map",
      icon: "location_on",
      path: `/field-map?district=${encodeURIComponent(d)}`,
    }));

  filteredResults = [...filteredResults, ...matchedDistricts];

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (langBtnRef.current && !langBtnRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showResults || filteredResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      console.log("Navigating to:", filteredResults[selectedIndex].path);
      navigate(filteredResults[selectedIndex].path);
      setSearchQuery("");
      setShowResults(false);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  const handleSelect = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowResults(false);
  };

  const navItems = [
    { label: t("dashboard"), icon: "apps", path: "/dashboard" },
    { label: t("fieldData"), icon: "table_chart", path: "/field-data" },
    { label: t("map"), icon: "map", path: "/field-map" },
    { label: t("weather"), icon: "cloud", path: "/weather" },
    { label: t("alerts"), icon: "notification_important", path: "/alerts" },
    { label: t("report"), icon: "bar_chart", path: "/report" },
    { label: t("help"), icon: "help", path: "/help" },
  ];

  const currentLang =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <>
      <nav className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-3rem)] max-w-7xl z-50 glass h-12 sm:h-14 rounded-2xl shadow-2xl border-white/20 overflow-visible">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-full">
          <div className="flex justify-between items-center h-full gap-2 sm:gap-4">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 active:scale-95 transition-transform"
              >
                <img
                  src={logo}
                  alt="RiceVision"
                  className="h-8 sm:h-9 w-auto drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] opacity-90 hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>

            {/* Navigation Links - hidden on mobile */}
            <div className="hidden md:flex items-center p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto no-scrollbar max-w-[50%] lg:max-w-none lg:overflow-visible">
              <div className="flex items-center min-w-max lg:min-w-0">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === "/dashboard" && location.pathname === "/");
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-[10px] lg:text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all duration-300 ${
                        isActive
                          ? "bg-white/15 text-white shadow-xl shadow-black/5 border border-white/20"
                          : "text-white/50 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] lg:text-[16px]">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Search Bar - hidden on small screens */}
              <div className="relative hidden lg:block" ref={searchRef}>
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 transition text-[18px] pointer-events-none"
                  style={{
                    color:
                      showResults && filteredResults.length
                        ? "rgb(52 211 153)"
                        : undefined,
                  }}
                >
                  search
                </span>
                <input
                  ref={(el) => {
                    inputRef.current = el;
                    searchInputRef.current = el;
                  }}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    updateDropdownPos();
                    setShowResults(true);
                  }}
                  onFocus={() => {
                    if (searchQuery) {
                      updateDropdownPos();
                      setShowResults(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={t("searchPlaceholder")}
                  className="w-24 xl:w-36 bg-white/5 border border-white/10 rounded-xl py-1 pl-9 pr-3 text-xs text-white text-center placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white/10 focus:border-white/20 transition-all shadow-inner"
                  autoComplete="off"
                />
                {showResults &&
                  (filteredResults.length > 0 || searchQuery) &&
                  createPortal(
                    <div
                      style={{
                        position: "fixed",
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        minWidth: 288,
                        zIndex: 9999,
                      }}
                      className="bg-[#0f1a12]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                      {filteredResults.length > 0 ? (
                        filteredResults.map((item, idx) => (
                          <button
                            key={item.path}
                            onMouseDown={() => handleSelect(item.path)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${idx === selectedIndex ? "bg-emerald-500/20" : "hover:bg-white/5"}`}
                          >
                            <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                              {item.icon}
                            </span>
                            <div>
                              <p className="text-xs font-semibold text-white">
                                {item.label}
                              </p>
                              <p className="text-[10px] text-white/40">
                                {item.description}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3">
                          <p className="text-xs text-white/40">
                            No results for &ldquo;{searchQuery}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>,
                    document.body,
                  )}
              </div>

              {/* Actions */}
              <div className="hidden sm:flex items-center gap-1.5 border-l border-white/10 pl-3">
                {/* Language Selector */}
                <div className="relative" ref={langBtnRef}>
                  <button
                    ref={languageBtnRef}
                    className="h-8 px-2 rounded-lg flex items-center gap-1 text-white/50 hover:text-white hover:bg-white/10 transition"
                    title="Language"
                    onClick={() => {
                      if (langBtnRef.current) {
                        const rect = langBtnRef.current.getBoundingClientRect();
                        setLangDropdownPos({
                          top: rect.bottom + 8,
                          right: window.innerWidth - rect.right,
                        });
                      }
                      setLangOpen((o) => !o);
                    }}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      language
                    </span>
                    <span className="text-xs font-semibold">
                      {currentLang.short}
                    </span>
                  </button>
                  {langOpen &&
                    createPortal(
                      <div
                        ref={langRef}
                        style={{
                          position: "fixed",
                          top: langDropdownPos.top,
                          right: langDropdownPos.right,
                          zIndex: 9999,
                        }}
                        className="bg-[#0f1a12]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]"
                      >
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onMouseDown={() => {
                              setLanguage(lang.code);
                              setLangOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/10 ${
                              language === lang.code
                                ? "bg-emerald-500/20 text-white"
                                : "text-white/60"
                            }`}
                          >
                            <span className="text-xs font-semibold">
                              {lang.short}
                            </span>
                            <span className="text-xs">{lang.label}</span>
                          </button>
                        ))}
                      </div>,
                      document.body,
                    )}
                </div>
                <button
                  ref={themeBtnRef}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
                  title="Toggle Dark Mode"
                  onClick={toggleTheme}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isDark ? "light_mode" : "dark_mode"}
                  </span>
                </button>
                <div ref={notificationBtnRef}>
                  <NotificationPanelButton />
                </div>
              </div>

              {/* Avatar - hidden on mobile */}
              <Link
                ref={profileBtnRef}
                to="/profile"
                className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
                title="View Profile"
              >
                <span className="material-symbols-outlined text-[20px]">
                  person
                </span>
              </Link>

              {/* Mobile hamburger button */}
              <button
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {mobileMenuOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-20 left-3 right-3 glass rounded-2xl border border-white/10 shadow-2xl p-4 space-y-2 max-h-[calc(100vh-6rem)] overflow-y-auto">
            {/* Search bar for mobile */}
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                autoComplete="off"
              />
            </div>
            {/* Mobile search results */}
            {searchQuery && filteredResults.length > 0 && (
              <div className="mb-2 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                {filteredResults.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      handleSelect(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/10 transition"
                  >
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                      {item.icon}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {/* Nav items */}
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/dashboard" && location.pathname === "/");
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-white/15 text-white border border-white/20"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
            {/* Mobile-only actions */}
            <div className="border-t border-white/10 pt-3 mt-2 flex flex-col gap-3">
              {/* Language options */}
              <div className="flex items-center gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`h-9 px-3 rounded-lg flex items-center gap-1.5 transition text-sm font-semibold ${
                      language === lang.code
                        ? "bg-emerald-500/20 text-white border border-white/20"
                        : "text-white/50 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      language
                    </span>
                    {lang.short}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
                    onClick={toggleTheme}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isDark ? "light_mode" : "dark_mode"}
                    </span>
                  </button>
                  <NotificationPanelButton />
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition text-sm font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Tooltips */}
      {showTutorial && currentTutorialStep && tutorialSteps[currentTutorialStep - 1] && (
        <TutorialTooltip
          title={tutorialSteps[currentTutorialStep - 1].title}
          action={tutorialSteps[currentTutorialStep - 1].action}
          outcome={tutorialSteps[currentTutorialStep - 1].outcome}
          targetRef={tutorialSteps[currentTutorialStep - 1].ref}
          currentStep={currentTutorialStep}
          totalSteps={tutorialSteps.length}
          pageName="Header"
        />
      )}
    </>
  );
};

// notification-specific button component so header stays clean
function NotificationPanelButton() {
  const [show, setShow] = useState(false);
  const [unread, setUnread] = useState(0);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [maxHeight, setMaxHeight] = useState(0);

  const buttonRef = useRef(null);
  const wrapperRef = useRef(null);

  const fetchCount = async () => {
    try {
      const { count, error } = await supabase
        .from("notificationpanel")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (error) throw error;
      setUnread(count || 0);
    } catch (e) {
      console.error("failed to get notifications count", e);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [show]);

  const handleRead = () => {
    fetchCount();
  };

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShow(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (show && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const top = rect.bottom + 8;

      setCoords({
        top,
        right: window.innerWidth - rect.right,
      });

      setMaxHeight(window.innerHeight - top - 16);
    }
  }, [show]);

  const panel = (
    <Notifications
      onRead={handleRead}
      style={{
        position: "fixed",
        top: coords.top,
        right: coords.right,
        zIndex: 9999,
        width: "20rem",
        maxHeight: maxHeight > 0 ? maxHeight : "24rem",
        overflowY: "auto",
      }}
    />
  );

  return (
    <div ref={wrapperRef} className="relative overflow-visible">
      <button
        ref={buttonRef}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition relative"
        title="Notifications"
        onClick={() => setShow((s) => !s)}
      >
        <span className="material-symbols-outlined text-[20px]">
          notifications
        </span>

        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] text-white rounded-full w-4 h-4 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {show && createPortal(panel, document.body)}
    </div>
  );
}

export default Header;
