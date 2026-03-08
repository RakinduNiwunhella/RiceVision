import React from "react";


const goals = [
  {
    id: "95% Accuracy Data",
    title: "Achieve 95% accuracy in rice crop health detection",
    desc: "Using satellite indices like NDVI, NDWI, LSWI, and red-edge bands, our system delivers highly accurate health classification to help farmers make informed decisions.",
    icon: "eco",
  },
  {
    id: "Paddy Monitoring",
    title: "Detect crop stress up to 3 weeks earlier",
    desc: "Identify water stress, disease, nutrient deficiency, and pest threats long before they become visible, reducing preventable yield losses.",
    icon: "visibility",
  },
  {
    id: "Predict Harvest Yield",
    title: "Predict harvest yield with 80%+ reliability",
    desc: "Our machine learning model estimates expected yield with high accuracy, helping farmers and government agencies plan for production and imports.",
    icon: "analytics",
  },
  {
    id: "Continuous Satellite Monitoring",
    title: "Provide automated 24/7 satellite monitoring",
    desc: "Leveraging Sentinel-2 data, we offer continuous, cloud-filtered monitoring of rice fields, without requiring manual field visits.",
    icon: "satellite_alt",
  },
  {
    id: "Reduce Human Efforts",
    title: "Reduce manual inspection efforts by 30%",
    desc: "By automating field health assessments, the system cuts down time, travel, and labor required for physical inspections.",
    icon: "assignment_turned_in",
  },
  {
    id: "Impact 1 Million Farmers",
    title: "Impact 1 million Sri Lankan farmers",
    desc: "Our platform aims to become a nationwide digital tool that empowers farmers with real-time insights, boosting food security and climate resilience.",
    icon: "group",
  },
];

export default function Goals() {
  return (
    <section id="goal" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <h2 className="text-5xl font-extrabold text-gray-900 leading-tight dark:text-white">
          Our Goals for <span className="block text-green-800 dark:text-green-400">2030</span>
        </h2>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl dark:text-gray-200">
          Our mission is to transform Sri Lanka's rice farming with accurate, satellite-powered insights. 
          By combining remote sensing and machine learning, we help farmers make smarter, faster, and more resilient decisions.
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