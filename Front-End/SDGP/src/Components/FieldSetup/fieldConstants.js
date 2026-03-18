/**
 * fieldConstants.js
 * Shared constants for the FieldSetup / FieldDrawMap flow.
 */

export const PRICE_PER_ACRE_LKR = 1000;
export const SQM_PER_ACRE = 4046.856422;

export const DISTRICTS = [
  { name: "Ampara",        file: "Ampara",        center: [7.30,  81.70], zoom: 10 },
  { name: "Anuradhapura",  file: "Anuradhapura",  center: [8.33,  80.40], zoom: 10 },
  { name: "Badulla",       file: "Badulla",        center: [6.99,  81.05], zoom: 10 },
  { name: "Batticaloa",    file: "Batticaloa",     center: [7.72,  81.69], zoom: 10 },
  { name: "Colombo",       file: "Colombo",        center: [6.92,  79.86], zoom: 11 },
  { name: "Galle",         file: "Galle",          center: [6.05,  80.22], zoom: 11 },
  { name: "Gampaha",       file: "Gampaha",        center: [7.09,  80.01], zoom: 11 },
  { name: "Hambantota",    file: "Hambantota",     center: [6.12,  81.12], zoom: 10 },
  { name: "Jaffna",        file: "Jaffna",         center: [9.67,  80.02], zoom: 11 },
  { name: "Kalutara",      file: "Kalutara",       center: [6.55,  80.20], zoom: 11 },
  { name: "Kandy",         file: "Kandy",          center: [7.29,  80.63], zoom: 11 },
  { name: "Kegalle",       file: "Kegalle",        center: [7.25,  80.33], zoom: 11 },
  { name: "Kilinochchi",   file: "Kilinochchi",    center: [9.40,  80.40], zoom: 11 },
  { name: "Kurunegala",    file: "Kurunegala",     center: [7.48,  80.36], zoom: 10 },
  { name: "Mannar",        file: "Mannar",         center: [8.98,  79.90], zoom: 11 },
  { name: "Matale",        file: "Matale",         center: [7.47,  80.62], zoom: 11 },
  { name: "Matara",        file: "Matara",         center: [5.95,  80.54], zoom: 11 },
  { name: "Moneragala",    file: "Moneragala",     center: [6.87,  81.35], zoom: 10 },
  { name: "Mullaitivu",    file: "Mullaitivu",     center: [9.27,  80.81], zoom: 11 },
  { name: "Nuwara Eliya",  file: "NuwaraEliya",    center: [6.96,  80.77], zoom: 11 },
  { name: "Polonnaruwa",   file: "Polonnaruwa",    center: [7.94,  81.00], zoom: 10 },
  { name: "Puttalam",      file: "Puttalam",       center: [7.96,  79.84], zoom: 10 },
  { name: "Ratnapura",     file: "Ratnapura",      center: [6.68,  80.40], zoom: 10 },
  { name: "Trincomalee",   file: "Trincomalee",    center: [8.57,  81.23], zoom: 10 },
  { name: "Vavuniya",      file: "Vavuniya",       center: [8.75,  80.50], zoom: 11 },
];

export const BASE_MAPS = {
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },
  street: {
    label: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
  terrain: {
    label: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "© OpenTopoMap contributors",
  },
  dark: {
    label: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO",
  },
};
