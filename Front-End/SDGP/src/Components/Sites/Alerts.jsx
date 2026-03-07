import React, { useState, useMemo, useEffect } from "react";
import { updateAlertStatus } from "../../api/api";

const tabOptions = ["Disasters", "Pest Risks"];

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState("Disasters");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const filteredAlerts = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return alerts.filter((alert) => {
      const title = (alert.title ?? "").toLowerCase();
      const description = (alert.description ?? "").toLowerCase();

      const matchesSearch =
        title.includes(normalizedSearch) || description.includes(normalizedSearch);

      return matchesSearch;
    });
  }, [alerts, searchTerm]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const isDisasters = activeTab === "Disasters";
        const endpoint = isDisasters
          ? "/api/alerts/disasters"
          : "/api/alerts/pest-risk";

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${isDisasters ? "disaster" : "pest risk"} alerts: ${response.status}`,
          );
        }

        const data = await response.json();

        if (isDisasters) {
          const mappedAlerts = (Array.isArray(data) ? data : []).map((a) => ({
            id: a.id,
            title: `${a.disaster_type} risk`,
            description: `Stage: ${a.stage} | Health: ${a.health}`,
            status: "Open",
            priority: "High",
            field: a.district,
            timestamp: a.timestamp,
            lat: a.lat,
            lon: a.lon,
          }));

          setAlerts(mappedAlerts);
        } else {
          const mappedAlerts = (Array.isArray(data) ? data : []).map((a, index) => ({
            id: a.id ?? index,
            title: a.title ?? a.pest_type ?? "Pest Risk Alert",
            description: a.description ?? a.details ?? "",
            status: "Open",
            priority: a.priority ?? a.risk_level ?? "Medium",
            field: a.field ?? a.location ?? a.district ?? "Unknown Field",
            timestamp: a.timestamp ?? a.created_at ?? new Date().toISOString(),
          }));

          setAlerts(mappedAlerts);
        }
      } catch (err) {
        console.error("Error fetching alerts:", err);
      }
    };

    loadAlerts();
  }, [activeTab]);

  const counts = useMemo(() => {
    const countObj = { Open: 0, Resolved: 0, Denied: 0 };
    alerts.forEach((alert) => {
      if (countObj[alert.status] !== undefined) {
        countObj[alert.status]++;
      }
    });
    countObj.All = alerts.length;
    return countObj;
  }, [alerts]);

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id ? { ...alert, _justUpdated: true } : alert,
        ),
      );

      setTimeout(async () => {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === id
              ? { ...alert, status: newStatus, _justUpdated: false }
              : alert,
          ),
        );

        await updateAlertStatus(id, newStatus);
      }, 300);
    } catch (err) {
      console.error("Error updating alert:", err);
    } finally {
      setTimeout(() => setUpdatingId(null), 300);
    }
  };

  const handleResolve = (id) => {
    updateStatus(id, "Resolved");
  };

  const handleDeny = (id) => {
    updateStatus(id, "Denied");
  };

  const formatTimestamp = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="min-h-full p-6 lg:p-10 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              Field Risk Alerts
            </h1>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-sm mt-1 font-bold uppercase tracking-[0.2em]">Automated Sentinel Monitoring</p>
          </div>

          {/* Stats mini-glass */}
          <div className="flex gap-3">
            <div className="glass px-4 py-2 rounded-xl border-white/10">
              <span className="text-[10px] font-black uppercase text-white/30 block">Active</span>
              <span className="text-xl font-black text-red-400">{counts.Open}</span>
            </div>
            <div className="glass px-4 py-2 rounded-xl border-white/10">
              <span className="text-[10px] font-black uppercase text-white/30 block">Resolved</span>
              <span className="text-xl font-black text-emerald-400">{counts.Resolved}</span>
            </div>
          </div>
        </div>

        {/* Search & Tabs Glass Container */}
        <div className="glass glass-hover p-6 rounded-[2rem] shadow-xl border-white/20">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            {/* Category Tabs */}
            <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
              {tabOptions.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === tab
                    ? "glass bg-white/15 text-white shadow-lg border-white/20"
                    : "text-white/40 hover:text-white/70"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Modern Search */}
            <div className="relative group flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition">
                search
              </span>
              <input
                type="text"
                placeholder="Find specific anomaly..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white/10 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-6">
          {filteredAlerts.length === 0 && (
            <div className="glass p-20 rounded-[2rem] text-center">
              <span className="material-symbols-outlined text-6xl text-white/10 mb-4">check_circle</span>
              <p className="text-white/30 font-bold uppercase tracking-widest">No active threats detected</p>
            </div>
          )}

          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`glass glass-hover p-6 rounded-3xl border border-white/10 shadow-lg transition-all transform hover:-translate-x-1 duration-300 relative overflow-hidden group ${alert.status === "Open" ? "border-l-4 border-l-red-500/50" :
                alert.status === "Resolved" ? "border-l-4 border-l-emerald-500/50" :
                  "border-l-4 border-l-white/20"
                }`}
            >
              {/* Status Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 opacity-20 pointer-events-none ${alert.status === "Open" ? "bg-red-500" :
                alert.status === "Resolved" ? "bg-emerald-500" :
                  "bg-white"
                }`} />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-white group-hover:text-emerald-400 transition">{alert.title ?? ""}</h2>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-black uppercase text-white/40 border border-white/5">{alert.field}</span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed max-w-3xl">
                    {alert.description ?? ""}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
                      <span className="material-symbols-outlined text-xs">priority_high</span>
                      {alert.priority}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>
                </div>

                {alert.status === "Open" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-6 py-2.5 glass bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/30 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleDeny(alert.id)}
                      className="px-6 py-2.5 glass bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 text-xs font-black uppercase tracking-widest border border-white/10 rounded-xl transition-all active:scale-95"
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
