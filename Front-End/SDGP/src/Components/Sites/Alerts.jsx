import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateAlertStatus } from "../../api/api";

const API_BASE = "https://ricevision-cakt.onrender.com";
const tabOptions = ["Disasters", "Pest Risks", "Past Alerts"];

const formatTitle = (text) =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

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
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch);

      if (activeTab === "Past Alerts") {
        return (
          matchesSearch &&
          (alert.status === "Resolved" || alert.status === "Denied")
        );
      }

      return matchesSearch;
    });
  }, [alerts, searchTerm, activeTab]);

  useEffect(() => {
    if (activeTab === "Past Alerts") return;

    const loadAlerts = async () => {
      try {
        const isDisaster = activeTab === "Disasters";

        const endpoint = isDisaster
          ? `${API_BASE}/api/alerts/disasters`
          : `${API_BASE}/api/alerts/pest-risk`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }

        const data = await response.json();

        if (isDisaster) {
          const mappedAlerts = (Array.isArray(data) ? data : []).map((a) => ({
            id: a.id,
            title: formatTitle(`${a.disaster_type} risk`),
            description: `Stage: ${a.stage} | Health: ${a.health}`,
            status: "Open",
            priority: "High",
            field: a.district,
            health: a.health,
            timestamp: a.timestamp,
            lat: a.lat,
            lon: a.lon,
          }));

          setAlerts(mappedAlerts);
        } else {
          const mappedAlerts = (Array.isArray(data) ? data : [])
            .filter((a) => a.risky_pixels > 0)
            .map((a, index) => ({
              id: index,
              title: `${a.district} • ${a.risky_pixels} RISKS`,
              description: "Multiple pest risks detected in this district.",
              status: "Open",
              priority: "High",
              field: a.district,
              health: a.health,
              count: a.risky_pixels,
              locations: a.risky_pixel_locations || [],
              timestamp: new Date().toISOString(),
            }));

          setAlerts(mappedAlerts);
          console.log("Received health:", state?.health);
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
          alert.id === id ? { ...alert, _justUpdated: true } : alert
        )
      );

      setTimeout(async () => {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === id
              ? { ...alert, status: newStatus, _justUpdated: false }
              : alert
          )
        );

        await updateAlertStatus(id, newStatus);
      }, 300);
    } catch (err) {
      console.error("Error updating alert:", err);
    } finally {
      setTimeout(() => setUpdatingId(null), 300);
    }
  };

  const navigate = useNavigate();

  const handleResolve = (id) => updateStatus(id, "Resolved");
  const handleDeny = (id) => updateStatus(id, "Denied");

  const handleViewInMap = (alert) => {
    if (activeTab === "Pest Risks" && alert.locations?.length > 0) {
      navigate("/field-map", {
        state: {
          type: "pest",
          district: alert.field,
          locations: alert.locations,
        },
      });
    } else if (alert.lat != null && alert.lon != null) {
      navigate("/field-map", {
        state: {
          type: "disaster",
          district: alert.field,
          disasterType: alert.title,
          health: alert.health,
          lat: alert.lat,
          lon: alert.lon,
        },
      });
    }
  };

  const formatTimestamp = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="min-h-full p-6 lg:p-10 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white">
              Field Risk Alerts
            </h1>
            <p className="text-white/40 text-xs mt-1 font-bold uppercase tracking-[0.2em]">
              Automated Sentinel Monitoring
            </p>
          </div>

          <div className="flex gap-3">
            <div className="glass px-4 py-2 rounded-xl border-white/10">
              <span className="text-[10px] font-black uppercase text-white/30 block">
                Active
              </span>
              <span className="text-xl font-black text-red-400">
                {counts.Open}
              </span>
            </div>

            <div className="glass px-4 py-2 rounded-xl border-white/10">
              <span className="text-[10px] font-black uppercase text-white/30 block">
                Resolved
              </span>
              <span className="text-xl font-black text-emerald-400">
                {counts.Resolved}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="glass p-6 rounded-[2rem] border-white/20">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">

            <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
              {tabOptions.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white/70"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Find specific anomaly..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-6">

          {filteredAlerts.length === 0 && (
            <div className="glass p-20 rounded-[2rem] text-center">
              <p className="text-white/30 font-bold uppercase">
                No active threats detected
              </p>
            </div>
          )}

          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="glass p-6 rounded-3xl border border-white/10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                <div>
                  <h2 className="text-xl font-black text-emerald-400">
                    {activeTab === "Pest Risks" && alert.count != null ? (
                      <>{alert.field} : <span className="text-red-500">{alert.count} RISKS</span> </>
                    ) : (
                      alert.title
                    )}
                  </h2>

                  <p className="text-white/60 text-sm mt-1">
                    {alert.description}
                  </p>

                  <span className="text-xs text-white/40">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>

                {alert.status === "Open" && activeTab !== "Past Alerts" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-6 py-2 bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold"
                    >
                      Resolve
                    </button>

                    <button
                      onClick={() => handleDeny(alert.id)}
                      className="px-6 py-2 bg-white/10 text-white/60 rounded-xl text-xs font-bold"
                    >
                      Deny
                    </button>

                    <button
                      onClick={() => handleViewInMap(alert)}
                      className="px-6 py-2 bg-white/10 text-white/60 rounded-xl text-xs font-bold"
                    >
                      View in Map
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