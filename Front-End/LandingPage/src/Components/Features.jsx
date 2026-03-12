import React from "react";

export default function Features() {
  const features = [
    {
      title: "Vegetation Index Analysis",
      description:
        "Calculates NDVI, EVI, NDWI, and LSWI from Sentinel-2 multispectral imagery to measure plant greenness, biomass, water content, and soil moisture across rice fields.",
      img: "/images/Real-timeStatistics.webp",
    },
    {
      title: "Interactive Dashboard",
      description:
        "Crop health maps, growth stage tracking, yield forecasts, and risk alerts presented through an interactive visual interface for easy decision-making.",
      img: "/images/InteractiveVisualization.webp",
    },
    {
      title: "Yield Forecasting",
      description:
        "Machine learning models analyze vegetation indices and historical data to estimate rice production levels before harvest, supporting food security planning.",
      img: "/images/BoundaryDelineation.webp",
    },
    {
      title: "Crop Health & Risk Detection",
      description:
        "Detects rice growth stages, classifies crop health conditions, and identifies anomalies such as floods, drought, or nutrient deficiency at early stages.",
      img: "/images/CropHealthMonitoring.webp",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-2 dark:text-white">
          What <span className="text-green-600">We</span> Provide
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Satellite-powered insights for smarter rice farming
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto px-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow dark:bg-black"
          >
            <img
              src={feature.img}
              alt={feature.title}
              className="w-full h-56 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4 dark:text-gray-300">{feature.description}</p>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
