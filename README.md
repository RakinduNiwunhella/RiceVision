🌾 RiceVision

**Satellite & AI-Powered Rice Crop Monitoring System for Sri Lanka**

RiceVision is a data-driven agricultural intelligence platform that uses satellite imagery, remote sensing indices, and machine learning to monitor rice cultivation across Sri Lanka.
The system supports early detection of crop stress, pest outbreaks, irrigation failures, and climate-driven risks, helping stakeholders make timely, informed decisions.

📌 Project Motivation**
**
Rice is Sri Lanka’s primary staple crop, yet farmers and policymakers face challenges such as:

Climate variability (heat stress, floods, droughts)

Pest and disease outbreaks

Inefficient irrigation management

Delayed or manual crop health assessments

RiceVision addresses these challenges by combining Earth observation data with AI-driven analytics to deliver near real-time insights at field, district, and national scales.

**🚀 Key Features**

🌍 Satellite-based crop monitoring (Sentinel-2, Landsat, MODIS)

📊 Vegetation & stress indices

NDVI, CVI, NDWI, S2REP, SIPI

🔥 Thermal anomaly detection

Climate stress vs local irrigation failure

🐛 Pest & outbreak risk prediction using ML models

🗺️ Interactive GIS dashboard

Heatmaps, anomaly layers, time-series analysis

📡 Google Earth Engine (GEE) pipeline

⚡ FastAPI-powered backend

🧠 Machine Learning–based risk fusion

**🏗️ System Architecture**

Satellite Data (Sentinel-2 / Landsat / MODIS)
            ↓
   Google Earth Engine (Preprocessing & Indices)
            ↓
        ML Models (Stress, Pest, Outbreak Risk)
            ↓
         FastAPI Backend
            ↓
     Web Dashboard (React + Leaflet)

**🧪 Technologies Used**

🌐 Data & Remote Sensing

Google Earth Engine (GEE)

Sentinel-2 MSI

Landsat 8/9

MODIS LST

🧠 Machine Learning

Scikit-learn

Random Forest / Gradient Boosting

Risk fusion models

🖥️ Backend

FastAPI

Python

Supabase (Auth & Database)

🎨 Frontend

React

Leaflet.js

Tailwind CSS

Figma (UI/UX Design)

**📂 Repository Structure**

RiceVision/
│
├── backend/
│   ├── app.py
│   ├── risk_fusion.py
│   ├── models/
│   └── services/
│
├── gee/
│   ├── ndvi_pipeline.py
│   ├── anomaly_detection.py
│   └── rainfall_analysis.py
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
│
├── docs/
│   ├── architecture.md
│   └── datasets.md
│
└── README.md

**📊 Use Cases**

🧑‍🌾 Farmers – Identify stressed fields early

🏛️ Government agencies – Monitor district-level crop health

🌾 Agricultural researchers – Analyze seasonal patterns

📦 Policy makers – Support food security planning

🧠 Example Insights

High MODIS LST + High Landsat LST → Climate-driven heat stress

Normal MODIS LST + Local Landsat hot spot → Irrigation failure

Cool Landsat patch → Flooded or waterlogged paddy fields


**👥 Team
**
RiceVision is developed as part of the
Software Development Group Project (SDGP)
University of Westminster / IIT Sri Lanka.


**📜 License**

This project is developed for academic and research purposes.
