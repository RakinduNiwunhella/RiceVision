import React from 'react'
import bgVideo from '../assets/bgVideo.webm'

const Hero = () => {
  return (
    <section className="relative w-full">
      {/* full-bleed hero background */}
      <div className="w-full min-h-[70vh] md:min-h-screen relative overflow-hidden">
        {/* Video background */}
            <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover -z-10"
            src={bgVideo}
            >
            <source src={bgVideo} type="video/webm" />
            </video>
        {/* small info button at bottom-left of the hero */}


        {/* floating card centered on mobile; right-aligned on md+ */}
        <div className="absolute inset-0 flex items-center justify-center md:justify-end pointer-events-none">
          <div className="w-full max-w-2xl px-4 md:px-0 md:max-w-lg lg:max-w-xl md:mr-6 lg:mr-20 transform translate-y-4 pointer-events-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 md:p-12">
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-center dark:text-white">Protect Sri Lanka's Paddy 
<br className="hidden md:block" />Fields</h1>
              <p className="mt-4 text-center text-slate-600 dark:text-white">Real-time satellite insights supporting sustainable farming.</p>

              <div className="mt-8 flex justify-center">
                <a href="#info" className="px-8 py-3 bg-green-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-green-400">LEARN MORE</a>
              </div>

              <div className="mt-8 border-t pt-4 flex items-center justify-center gap-3 dark:text-white">
                <span className="material-icons text-slate-700 text-[20px] dark:text-white">explore</span>
                <a href="#features" className="text-sm font-semibold text-slate-700 dark:text-white">Explore what we do</a>
              </div>
            </div>
          </div>
        </div>
      </div>



    </section>



)
}

export default Hero