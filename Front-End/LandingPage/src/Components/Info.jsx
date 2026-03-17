import React from "react";
import Reveal from "./Reveal";

function Info() {
  return (
    <section id="info">
    <div className="w-full bg-white dark:bg-slate-900 py-20 px-8 md:px-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
        {/* LEFT SECTION */}
        <Reveal>
        <div className="flex flex-col justify-center h-full">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
           Agricultural Intelligence <br/> Powered by Satellites
          </h2>

          <p className="mt-6 text-lg text-gray-700 leading-relaxed text-justify dark:text-white">
            RiceVision is a satellite-based agricultural monitoring system that observes rice cultivation, analyzes crop health, and predicts future yield using remote sensing and machine learning. By replacing costly manual field inspections with automated satellite imagery analysis, we deliver accurate, large-scale insights to support sustainable food production across Sri Lanka.
          </p>
        </div>
        </Reveal>

        {/* RIGHT SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 ">

          {/* Box 1 */}
          <Reveal delay={0}>
          <div className="border-l-8 border-green-800 pl-0 md:pl-10 rounded-lg p-8 shadow-lg  bg-white dark:bg-slate-800 transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-2" >
            <h3 className="text-xl font-bold text-green-800 dark:text-green-400 flex items-center gap-1">
              Who We Are <span className="text-green-700">&gt;</span>
            </h3>
            <p className="text-gray-700 dark:text-slate-300 mt-3">
            We integrate satellite remote sensing, geospatial analysis, and machine learning to monitor rice cultivation and forecast yields across Sri Lanka.</p>
          </div>
          </Reveal>

          {/* Box 2 */}
          <Reveal delay={80}>
          <div className="border-l-8 border-green-800 pl-0 md:pl-10 rounded-lg p-8 shadow-lg  bg-white dark:bg-slate-800 transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-2">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-400 flex items-center gap-1">
              What We Do <span className="text-green-700">&gt;</span>
            </h3>
            <p className="text-gray-700 dark:text-slate-300 mt-3">
             We collect Sentinel-1 and Sentinel-2 imagery via Google Earth Engine, calculate vegetation indices (NDVI, EVI, NDWI), and use machine learning models to detect growth stages, classify crop health, and predict harvest yields.
            </p>
          </div>
          </Reveal>

          {/* Box 3 */}
          <Reveal delay={160}>
          <div className="border-l-8 dark:bg-slate-800 border-green-800 pl-0 md:pl-10 rounded-lg p-8 shadow-lg  bg-white transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-2">
            <h3 className="text-xl font-bold text-green-800 flex items-center gap-1 dark:text-green-400">
              How To Help <span className="text-green-700">&gt;</span>
            </h3>
            <p className="text-gray-700 dark:text-slate-300 mt-3">
            Partner with us to advance data-driven agriculture. Share field data, collaborate on pilot regions, or use our insights to help farmers, researchers, and policymakers make better decisions.</p>
          </div>
          </Reveal>

          {/* Box 4 */}
          <Reveal delay={240}>
          <div className="border-l-8 dark:bg-slate-800 border-green-800 pl-0 md:pl-10 rounded-lg p-8 shadow-lg bg-white transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-2">
            <h3 className="text-xl dark:text-green-400 font-bold text-green-800 flex items-center gap-1">
              Where We Work <span className="text-green-700">&gt;</span>
            </h3>
            <p className="text-gray-700 dark:text-slate-300 mt-3">
             Our system covers major paddy-growing districts across both Yala and Maha seasons. Satellite images are preprocessed to remove cloud cover, enabling continuous and reliable year-round monitoring.
            </p>
          </div>
          </Reveal>

        </div>
      </div>

      {/* Divider line */}
      <Reveal delay={320}>
      <div className="border-b border-gray-300 mt-16 dark:border-slate-600"></div>
      </Reveal>
    </div>
  </section> 
 
); 
}

export default Info;
