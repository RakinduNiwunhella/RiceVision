import React from "react";

export default function Features() {
  const features = [
    {
      title: "Real-time Statistics",
      description:
        "Up-to-date data on paddy cultivation metrics across all regions with comprehensive dashboards showing yield predictions, growth stages, and regional comparisons.",
      img: "/images/Real-timeStatistics.webp",
    },
    {
      title: "Interactive Visualisation",
      description:
        "Dynamic maps showing paddy land distribution with zoom capabilities, layer controls, and real-time updates for accurate field monitoring.",
      img: "/images/InteractiveVisualization.webp",
    },
    {
      title: "Boundary Delineation",
      description:
        "Precise mapping of paddy field boundaries using high-resolution satellite imagery with accuracy up to 1 meter for perfect land management.",
      img: "/images/BoundaryDelineation.webp",
    },
    {
      title: "Crop Health Monitoring",
      description:
        "NDVI and other vegetation indices calculated weekly to assess paddy health, with alerts for potential issues like disease or nutrient deficiencies.",
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
          Comprehensive solutions for modern agriculture
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
