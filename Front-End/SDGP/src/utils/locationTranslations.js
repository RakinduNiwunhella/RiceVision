import dsNameTranslations from "./dsNameTranslations.json";

const DISTRICT_TRANSLATIONS = {
  Ampara: { si: "අම්පාර", ta: "அம்பாறை" },
  Anuradhapura: { si: "අනුරාධපුර", ta: "அனுராதபுரம்" },
  Badulla: { si: "බදුල්ල", ta: "பதுளை" },
  Batticaloa: { si: "මඩකලපුව", ta: "மட்டக்களப்பு" },
  Colombo: { si: "කොළඹ", ta: "கொழும்பு" },
  Galle: { si: "ගාල්ල", ta: "காலி" },
  Gampaha: { si: "ගම්පහ", ta: "கம்பஹா" },
  Hambantota: { si: "හම්බන්තොට", ta: "ஹம்பாந்தோட்டை" },
  Jaffna: { si: "යාපනය", ta: "யாழ்ப்பாணம்" },
  Kalutara: { si: "කළුතර", ta: "களுத்துறை" },
  Kandy: { si: "මහනුවර", ta: "கண்டி" },
  Kegalle: { si: "කෑගල්ල", ta: "கேகாலை" },
  Kilinochchi: { si: "කිලිනොච්චි", ta: "கிளிநொச்சி" },
  Kurunegala: { si: "කුරුණෑගල", ta: "குருநாகல்" },
  Mannar: { si: "මන්නාරම", ta: "மன்னார்" },
  Matale: { si: "මාතලේ", ta: "மாத்தளை" },
  Matara: { si: "මාතර", ta: "மாத்தறை" },
  Monaragala: { si: "මොනරාගල", ta: "மொனராகலை" },
  Mullaitivu: { si: "මුලතිව්", ta: "முல்லைத்தீவு" },
  "Nuwara Eliya": { si: "නුවර එළිය", ta: "நுவரெலியா" },
  Polonnaruwa: { si: "පොළොන්නරුව", ta: "பொலன்னறுவை" },
  Puttalam: { si: "පුත්තලම", ta: "புத்தளம்" },
  Ratnapura: { si: "රත්නපුර", ta: "இரத்தினபுரி" },
  Trincomalee: { si: "ත්‍රිකුණාමලය", ta: "திருகோணமலை" },
  Vavuniya: { si: "වවුනියාව", ta: "வவுனியா" },
};

const DISTRICT_ALIASES = {
  Moneragala: "Monaragala",
};

const normalizeName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");

const DISTRICT_LOOKUP = Object.keys(DISTRICT_TRANSLATIONS).reduce((acc, key) => {
  acc[normalizeName(key)] = key;
  return acc;
}, {});

Object.entries(DISTRICT_ALIASES).forEach(([alias, canonical]) => {
  DISTRICT_LOOKUP[normalizeName(alias)] = canonical;
});

const DS_LOOKUP = Object.keys(dsNameTranslations).reduce((acc, key) => {
  acc[normalizeName(key)] = key;
  return acc;
}, {});

const pickTranslation = (entry, canonical, language) => {
  if (!entry || language === "en") return canonical;
  if (language === "si") return entry.si || canonical;
  if (language === "ta") return entry.ta || canonical;
  return canonical;
};

export function getCanonicalDistrictName(name) {
  const canonical = DISTRICT_LOOKUP[normalizeName(name)];
  return canonical || String(name || "").trim();
}

export function translateDistrictName(name, language = "en") {
  const canonical = getCanonicalDistrictName(name);
  const translation = DISTRICT_TRANSLATIONS[canonical];
  return pickTranslation(translation, canonical, language);
}

export function translateDsName(name, language = "en") {
  const normalized = normalizeName(name);
  const dsCanonical = DS_LOOKUP[normalized];

  if (dsCanonical) {
    const translation = dsNameTranslations[dsCanonical];
    return pickTranslation(translation, dsCanonical, language);
  }

  return translateDistrictName(name, language);
}

export function translatePlaceName(name, language = "en") {
  return translateDsName(name, language);
}

export const SRI_LANKA_DISTRICTS = Object.keys(DISTRICT_TRANSLATIONS);
