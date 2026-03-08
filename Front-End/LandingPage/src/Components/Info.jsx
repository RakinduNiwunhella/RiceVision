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
           Stepping Up Agricultural  <br/> Intelligence in Sri Lanka
          </h2>

          <p className="mt-6 text-lg text-gray-700 leading-relaxed text-justify dark:text-white">
            Alongside farmers, government agencies and researchers, we are transforming how Sri Lanka monitors paddy fields reducing crop losses, 
            strengthening food security, and supporting smarter decisions through satellite powered insights.
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
            We are building Sri Lanka's first satellite-based rice monitoring and yield prediction system using
             Earth Observation, machine learning, and field data.</p>
          </div>
          </Reveal>

          {/* Box 2 */}
          <Reveal delay={80}>
          <div className="border-l-8 border-green-800 pl-0 md:pl-10 rounded-lg p-8 shadow-lg  bg-white dark:bg-slate-800 transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-2">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-400 flex items-center gap-1">
              What We Do <span className="text-green-700">&gt;</span>
            </h3>
            <p className="text-gray-700 dark:text-slate-300 mt-3">
             We use Sentinel-1, Sentinel-2, and AI to track paddy health, growth stages, water stress, and yield
              in near real time. These insights help reduce losses, guide inputs, and support national food security
               planning.
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
            Partner with us to advance digital agriculture across Sri Lanka. Share field data, join pilots, or integrate
             our platform to help farmers make faster decisions and cut rice import dependence.</p>
          </div>
          </Reveal>

          {/* Box 4 */}
          <Reveal delay={240}>
          <div className="border-l-8 dark:bg-slate-800 border-green-800 pl-0 md:pl-10 rounded-lg p-8 shadow-lg bg-white transform transition duration-300 ease-in-out hover:scale-105 hover:-translate-y-2">
            <h3 className="text-xl dark:text-green-400 font-bold text-green-800 flex items-center gap-1">
              Where We Work <span className="text-green-700">&gt;</span>
            </h3>
            <p className="text-gray-700 dark:text-slate-300 mt-3">
             Our system spans major paddy-growing districts in both Yala and Maha seasons. Cloud-penetrating radar enables reliable, year round monitoring, even during heavy monsoons.
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
