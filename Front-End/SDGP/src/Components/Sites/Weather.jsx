import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeather } from "../../api/api";

const RiceVisionWeather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const fetchAgroWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWeather();
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgroWeather(); }, [fetchAgroWeather]);

  const getCondition = (code) => {
    if (code === 0) return { desc: "Optimal Day", icon: "☀️", color: "text-amber-500 dark:text-amber-400" };
    if (code <= 3) return { desc: "Good for Field", icon: "⛅", color: "text-emerald-600 dark:text-emerald-300" };
    if (code >= 51 && code <= 67) return { desc: "Wet/Rainy", icon: "🌧️", color: "text-blue-600 dark:text-blue-400" };
    return { desc: "Moderate Skies", icon: "☁️", color: "text-slate-500 dark:text-slate-400" };
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#050810] text-emerald-600 dark:text-emerald-500 font-bold text-xs uppercase tracking-widest">Updating Field Data...</div>;
  if (error) return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#050810] p-6 text-emerald-600 dark:text-emerald-400 font-bold">{error}</div>;

  const currentInfo = getCondition(weather.current.weather_code);
  const todayChance = weather.daily.precipitation_probability_max[7];

  return (
    <div className="min-h-[calc(100vh-3rem)] -mx-6 -mt-6 p-6 lg:p-10 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              Colombo Station
            </h1>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-sm mt-1 font-bold uppercase tracking-[0.2em]">Paddy Field Intelligence Network</p>
          </div>
          <div className="glass px-4 py-2 rounded-xl border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60">
            Live Telemetry Active
          </div>
        </header>

        {/* --- MAIN TODAY SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Hero Card */}
          <div className="lg:col-span-2 glass glass-hover bg-gradient-to-br from-emerald-500/40 to-teal-700/40 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[320px]">
            <div className="z-10">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-white/50 block mb-4">Current Conditions</span>
              <h2 className="text-7xl md:text-9xl font-black text-white leading-none">{Math.round(weather.current.temperature_2m)}°</h2>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl text-[10px] font-black border border-white/20 uppercase tracking-widest text-white">{currentInfo.desc}</span>
                <span className="bg-blue-500/20 backdrop-blur-md px-5 py-2.5 rounded-2xl text-[10px] font-black border border-blue-400/20 text-white uppercase tracking-widest">{todayChance}% Rain Chance</span>
              </div>
            </div>
            <span className="absolute right-[-20px] bottom-[-40px] text-[15rem] md:text-[22rem] opacity-20 pointer-events-none select-none filter blur-[2px]">{currentInfo.icon}</span>
          </div>

          {/* Moisture & Cloud Card */}
          <div className="glass glass-hover p-8 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Air Moisture</span>
                  <span className="text-3xl font-black text-emerald-400">{weather.current.relative_humidity_2m}%</span>
                </div>
                <div className={`h-1 w-full bg-white/5 rounded-full overflow-hidden`}>
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${weather.current.relative_humidity_2m}%` }} />
                </div>
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed font-medium italic">Humidity over 85% increases fungal risk protocols.</p>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cloud Density</span>
                <span className="text-2xl font-black text-white/90">{weather.current.cloud_cover}%</span>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase inline-block text-center w-full ${weather.current.cloud_cover > 70 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {weather.current.cloud_cover > 70 ? 'Poor Light' : 'Optimal Photons'}
              </div>
            </div>
          </div>

          {/* Wind & Rain Card */}
          <div className="glass glass-hover p-8 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Wind Velocity</span>
                  <span className="text-3xl font-black text-cyan-400">{weather.current.wind_speed_10m} <small className="text-xs">km/h</small></span>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase inline-block text-center w-full ${weather.current.wind_speed_10m > 15 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {weather.current.wind_speed_10m > 15 ? 'Critical Elevation' : 'Safe Spraying'}
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Surface Rain</span>
                <span className="text-2xl font-black text-blue-400">{weather.current.precipitation} <small className="text-xs">mm</small></span>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase inline-block text-center w-full ${weather.current.precipitation > 5 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                {weather.current.precipitation > 5 ? 'Active Saturation' : 'Dry Surface'}
              </div>
            </div>
          </div>
        </div>

        {/* --- FORECAST & HISTORY --- */}
        <div className="grid grid-cols-1 gap-12">
          <section>
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-white/10" />
              Planning Forecast
              <div className="h-[1px] flex-1 bg-white/10" />
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {weather.daily.time.slice(7).map((date, i) => {
                const idx = i + 7;
                const info = getCondition(weather.daily.weather_code[idx]);
                return (
                  <div key={idx} className="glass glass-hover p-6 rounded-3xl border border-white/10 text-center shadow-lg transition-all duration-500 hover:-translate-y-1">
                    <p className="text-[10px] text-white/40 font-black mb-4 uppercase tracking-widest">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</p>
                    <div className="text-4xl mb-6 filter drop-shadow-lg">{info.icon}</div>
                    <p className="text-3xl font-black text-white">{Math.round(weather.daily.temperature_2m_max[idx])}°</p>
                    <p className="text-[9px] font-black text-blue-400 uppercase mt-5 tracking-tighter">{weather.daily.precipitation_probability_max[idx]}% Rain Chance</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="opacity-60">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-white/5" />
              Field History (7 Days)
              <div className="h-[1px] flex-1 bg-white/5" />
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {weather.daily.time.slice(0, 7).map((date, i) => {
                const info = getCondition(weather.daily.weather_code[i]);
                return (
                  <div key={i} className="glass p-5 rounded-3xl border border-white/5 text-center grayscale opacity-80 backdrop-blur-sm">
                    <p className="text-[9px] text-white/30 font-bold mb-3 uppercase">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</p>
                    <div className="text-2xl mb-4">{info.icon}</div>
                    <p className="text-xl font-bold text-white/80">{Math.round(weather.daily.temperature_2m_max[i])}°</p>
                    <p className="text-[8px] font-black text-white/20 uppercase mt-4">{weather.daily.precipitation_sum[i]}mm Rain</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RiceVisionWeather;