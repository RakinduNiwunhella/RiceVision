import React, { useState, useEffect, useCallback } from 'react';

const RiceVisionWeather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const LAT = 6.9271; 
  const LON = 79.8612;


  const fetchAgroWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&past_days=7&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Connection failed.");
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [LAT, LON]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#050810] p-3 sm:p-6 md:p-10 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-6 md:mb-10 border-b border-slate-200 dark:border-slate-800 pb-4 md:pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Colombo Station</h1>
            <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm mt-1 font-bold uppercase tracking-wider">Paddy Field Intelligence Network</p>
          </div>
          
        </header>

        {/* --- MAIN TODAY SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12">
          
          {/* Hero Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-700 dark:from-emerald-600 dark:to-teal-950 p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[240px] sm:min-h-[300px]">
            <div className="z-10">
              <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-white">{Math.round(weather.current.temperature_2m)}°C</h2>
              <div className="mt-4 sm:mt-6 md:mt-8 flex flex-wrap gap-2 md:gap-3">
                <span className="bg-white/20 dark:bg-white/10 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black border border-white/30 uppercase tracking-widest text-white">{currentInfo.desc}</span>
                <span className="bg-blue-400/30 dark:bg-blue-500/20 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black border border-blue-200/30 text-white uppercase tracking-widest">{todayChance}% Rain Chance</span>
              </div>
            </div>
            <span className="absolute right-[-10px] bottom-[-20px] text-[8rem] sm:text-[12rem] md:text-[18rem] opacity-20 pointer-events-none select-none">{currentInfo.icon}</span>
          </div>

          {/* Moisture & Cloud Card */}
          <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-5 sm:space-y-6 md:space-y-8 shadow-sm dark:shadow-none">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase">Air Moisture</span>
                <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">{weather.current.relative_humidity_2m}%</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Humidity over 85% increases fungal risk.</p>
              <div className={`px-2.5 sm:px-3 py-1 rounded-md text-[8px] sm:text-[9px] font-bold uppercase inline-block ${weather.current.relative_humidity_2m > 85 ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                {weather.current.relative_humidity_2m > 85 ? 'High Risk' : 'Low Risk'}
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5 sm:pt-6">
              <div className="flex justify-between items-center">
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase">Cloud Density</span>
                <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">{weather.current.cloud_cover}%</span>
              </div>
              <div className={`px-2.5 sm:px-3 py-1 rounded-md text-[8px] sm:text-[9px] font-bold uppercase inline-block ${weather.current.cloud_cover > 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                {weather.current.cloud_cover > 70 ? 'Poor Light' : 'Max Light'}
              </div>
            </div>
          </div>

          {/* Wind & Rain Card */}
          <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-5 sm:space-y-6 md:space-y-8 shadow-sm dark:shadow-none">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase">Wind Speed</span>
                <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">{weather.current.wind_speed_10m} km/h</span>
              </div>
              <div className={`px-2.5 sm:px-3 py-1 rounded-md text-[8px] sm:text-[9px] font-bold uppercase inline-block ${weather.current.wind_speed_10m > 15 ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                {weather.current.wind_speed_10m > 15 ? 'No Spraying' : 'Safe Spraying'}
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5 sm:pt-6">
              <div className="flex justify-between items-center">
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase">Surface Rain</span>
                <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">{weather.current.precipitation} mm</span>
              </div>
              <div className={`px-2.5 sm:px-3 py-1 rounded-md text-[8px] sm:text-[9px] font-bold uppercase inline-block ${weather.current.precipitation > 5 ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                {weather.current.precipitation > 5 ? 'Flood Risk' : 'Normal'}
              </div>
            </div>
          </div>
        </div>

        {/* --- FORECAST & HISTORY --- */}
        <div className="space-y-8 sm:space-y-12 md:space-y-16">
          <section>
            <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] mb-4 sm:mb-6 md:mb-8">Planning Forecast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 md:gap-4">
              {weather.daily.time.slice(7).map((date, i) => {
                const idx = i + 7;
                const info = getCondition(weather.daily.weather_code[idx]);
                return (
                  <div key={idx} className="bg-white dark:bg-[#111827] p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-black mb-1.5 sm:mb-2 md:mb-3">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</p>
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 md:mb-4">{info.icon}</div>
                    <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white">{Math.round(weather.daily.temperature_2m_max[idx])}°</p>
                    <p className="text-[8px] sm:text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase mt-2 sm:mt-3 md:mt-4">{weather.daily.precipitation_probability_max[idx]}% Rain</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] mb-4 sm:mb-6 md:mb-8 border-t border-slate-200 dark:border-slate-800 pt-6 sm:pt-8">Field History</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 md:gap-4 opacity-70">
              {weather.daily.time.slice(0, 7).map((date, i) => {
                const info = getCondition(weather.daily.weather_code[i]);
                return (
                  <div key={i} className="bg-slate-100/50 dark:bg-[#111827]/40 p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/50 text-center grayscale">
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 dark:text-slate-600 font-bold mb-1.5 sm:mb-2 md:mb-3">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</p>
                    <div className="text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3 md:mb-4">{info.icon}</div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-400">{Math.round(weather.daily.temperature_2m_max[i])}°</p>
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mt-2 sm:mt-3 md:mt-4">{weather.daily.precipitation_sum[i]}mm Rain</p>
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