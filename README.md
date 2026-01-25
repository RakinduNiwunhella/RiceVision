# 🌾 RiceVision

## Satellite & AI-Powered Rice Crop Monitoring System for Sri Lanka

**RiceVision** is a data-driven agricultural intelligence platform that uses satellite imagery, remote sensing indices, and machine learning to monitor rice cultivation across Sri Lanka.  
The system supports **early detection of crop stress, pest outbreaks, irrigation failures, and climate-driven risks**, helping stakeholders make timely and informed decisions.

---

## 📌 Project Motivation

Rice is Sri Lanka’s primary staple crop, yet farmers and policymakers face several critical challenges:

- 🌦️ Climate variability (heat stress, floods, droughts)
- 🐛 Pest and disease outbreaks
- 💧 Inefficient irrigation management
- ⏳ Delayed or manual crop health assessments

**RiceVision** addresses these challenges by combining **Earth Observation data** with **AI-driven analytics** to deliver **near real-time insights** at **field, district, and national scales**.

---

## 🚀 Key Features

### 🌍 Satellite-Based Crop Monitoring
- Sentinel-2
- Landsat 8/9
- MODIS

### 📊 Vegetation & Stress Indices
- NDVI
- CVI
- NDWI
- S2REP
- SIPI

### 🔥 Thermal Anomaly Detection
- Climate-driven heat stress
- Local irrigation failures

### 🐛 Pest & Outbreak Risk Prediction
- Machine Learning-based risk modeling
- Climate + vegetation signal fusion

### 🗺️ Interactive GIS Dashboard
- Heatmaps
- Anomaly layers
- Time-series analysis

### 📡 Google Earth Engine (GEE) Pipeline
- Automated preprocessing
- Satellite synchronization
- Climate data fusion

### ⚡ FastAPI-Powered Backend
- REST APIs
- Model inference endpoints

### 🧠 Machine Learning–Based Risk Fusion
- Multi-source data integration
- Stress and outbreak probability scoring

---

## 🏗️ System Architecture

Satellite Data (Sentinel-2 / Landsat / MODIS)

↓
Google Earth Engine (Preprocessing & Indices)
↓
ML Models (Stress, Pest, Outbreak Risk)
↓
FastAPI Backend
↓
Web Dashboard (React + Leaflet)

---

## 🧪 Technologies Used

### 🌐 Data & Remote Sensing
- Google Earth Engine (GEE)
- Sentinel-2 MSI
- Landsat 8/9
- MODIS LST

### 🧠 Machine Learning
- Scikit-learn
- Random Forest
- Gradient Boosting
- Risk fusion models

### 🖥️ Backend
- FastAPI
- Python
- Supabase (Authentication & Database)

### 🎨 Frontend
- React
- Leaflet.js
- Tailwind CSS
- Figma (UI/UX Design)

---

## 📂 Repository Structure
```
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

---
```

## 📊 Use Cases

- 🧑‍🌾 **Farmers** – Identify stressed fields early
- 🏛️ **Government agencies** – Monitor district-level crop health
- 🌾 **Agricultural researchers** – Analyze seasonal and spatial patterns
- 📦 **Policy makers** – Support food security planning

---

## 👥 Team

RiceVision is developed as part of the  
**Software Development Group Project (SDGP)**  
**University of Westminster / IIT Sri Lanka**

---

## 📜 License

This project is developed for **academic and research purposes**.
