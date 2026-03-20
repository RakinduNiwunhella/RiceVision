import React from "react";


const goals = [
  {
    id: "Satellite Data Collection",
    title: "Sentinel-1 & Sentinel-2 imagery via Google Earth Engine",
    desc: "Multispectral satellite images capture detailed information about vegetation, moisture levels, and soil conditions across rice-growing regions.",
    icon: "satellite_alt",
  },
  {
    id: "Vegetation Index Analysis",
    title: "NDVI, EVI, NDWI & LSWI crop health indices",
    desc: "Vegetation indices measure plant greenness, biomass, water content, and soil moisture to determine crop health, growth stages, and stress factors.",
    icon: "eco",
  },
  {
    id: "ML-Based Yield Prediction",
    title: "Machine learning models forecast rice production",
    desc: "Trained models analyze processed satellite data and historical trends to estimate crop productivity and identify risks before harvest.",
    icon: "analytics",
  },
  {
    id: "Early Risk Detection",
    title: "Detect drought, floods & nutrient deficiency early",
    desc: "The system identifies anomalies such as flooding, drought, or crop stress at early stages, enabling timely interventions to reduce yield losses.",
    icon: "visibility",
  },
  {
    id: "Automated Monitoring",
    title: "Replace costly manual inspections with satellite analysis",
    desc: "Cloud-filtered satellite imagery is processed automatically, eliminating the need for time-consuming and geographically limited field visits.",
    icon: "assignment_turned_in",
  },
  {
    id: "Food Security Support",
    title: "Data-driven decisions for farmers and policymakers",
    desc: "Accurate production estimates help farmers plan irrigation and fertilizer usage, while governments can better plan imports, exports, and agricultural policies.",
    icon: "group",
  },
];

export default function Goals() {
  return (
    <section id="goal" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <h2 className="text-5xl font-extrabold text-gray-900 leading-tight dark:text-white">
          How <span className="block text-green-800 dark:text-green-400">RiceVision Works</span>
        </h2>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl dark:text-gray-200">
          RiceVision integrates satellite remote sensing, geospatial analysis, and machine learning to analyze crop conditions, predict yields, and support data-driven agricultural decision-making.
        </p>



        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {goals.map((g) => (
            <div
              key={g.id}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex gap-6 dark:bg-black"
            >
              <div className=" h-16 w-16 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-green-400">
                  {g.icon}
                </span>
              </div>

              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{g.id}</div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}