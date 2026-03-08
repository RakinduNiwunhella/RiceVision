import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import rice from "../assets/rice.jpg";
import Reveal from "./Reveal";

const Mission = ({ onOpenRegister }) => {

  // EMAIL STATE (added)
  const [email, setEmail] = useState("");

  // SUBMIT HANDLER (added)
  const handleSubmit = async (e) => {
    e.preventDefault();

    await supabase
      .from("waitlist_emails")
      .insert([{ email }]);

    setEmail("");
  };

  return (
    <Reveal>
      <section id="mission" className="bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="relative lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center pb-32">

            {/* Left Image */}
            <div className="relative w-full lg:col-span-6">
              <img
                src={rice}
                alt="Forest path"
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Right Content */}
            <div className="mt-10 lg:mt-0 lg:col-span-6">
              <div className="max-w-xl">
                <p className="text-sm font-semibold text-green-800 uppercase">
                  Our Mission
                </p>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Turning space-driven insights into healthier fields, empowered farmers, and a resilient Sri Lankan future.
                </h2>
                <p className="mt-4 text-gray-700 dark:text-slate-300">
                  RiceVision's mission is to revolutionise rice cultivation and national food planning in Sri Lanka by delivering an
                  integrated, satellite-powered decision-support system.
                </p>
                <button
                  onClick={onOpenRegister}
                  className="mt-6 bg-green-800 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-900 transition"
                >
                  Register Now
                </button>
              </div>
            </div>

            {/* Newsletter Card */}
            <div
              className="
                bg-white dark:bg-slate-800 border-t-4 border-green-800 shadow-xl rounded-lg
                w-11/12 md:w-3/4 lg:w-2/3 px-6 py-8 lg:px-10 lg:py-12
                mx-auto mt-8 lg:mt-0
                lg:absolute lg:left-5/8 lg:-translate-x-1/2 lg:-bottom-1 lg:transform
              "
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Be the first to know when RiceVision launches.
                Get early access updates directly to your inbox.
              </h3>

              {/* FORM UPDATED */}
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
                <div className="flex flex-col w-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Email address:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@email.com"
                    className="border border-gray-300 dark:border-slate-600 rounded-md px-4 py-2
                      text-gray-900 dark:text-white
                      placeholder-gray-400 dark:placeholder-slate-400
                      bg-white dark:bg-slate-700
                      focus:ring-2 focus:ring-green-800"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-green-800 text-white px-5 py-2 rounded-md font-semibold text-m whitespace-nowrap hover:bg-green-900 transition self-end"
                >
                  Notify Me
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </Reveal>
  );
};

export default Mission;
