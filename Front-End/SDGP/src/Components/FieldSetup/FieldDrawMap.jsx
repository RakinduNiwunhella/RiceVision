/**
 * FieldDrawMap.jsx
 *
 * Reusable interactive map for drawing/viewing a paddy field polygon.
 *
 * Props:
 *   onDraw(feature, acres, districtName) — fired whenever the user draws/edits a polygon
 *   onClear()                            — fired when the polygon is deleted
 *   initialFeature                       — existing GeoJSON Feature to display on mount
 *   readOnly                             — disable draw tools (view mode)
 *   height                               — CSS height string (default "480px")
 *
 * ── Supabase table required (run once in Supabase SQL editor) ──────────────────
 *
 * CREATE TABLE IF NOT EXISTS user_fields (
 *   id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
 *   field_name  text,
 *   geojson     jsonb   NOT NULL,
 *   area_acres  float   NOT NULL,
 *   price_lkr   integer NOT NULL,
 *   district    text,
 *   created_at  timestamptz DEFAULT now(),
 *   updated_at  timestamptz DEFAULT now()
 * );
 *
 * ALTER TABLE user_fields ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY "Users manage own field" ON user_fields
 *   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { DISTRICTS, BASE_MAPS, SQM_PER_ACRE, PRICE_PER_ACRE_LKR } from "./fieldConstants";

/* ── Constants ─────────────────────────────────────────────────────────────── */
const SL_CENTER = [7.8731, 80.7718];

/* ── geodesic area helper (provided by leaflet-draw) ─────────────────────── */
function calcAreaM2(layer) {
  try {
    if (L.GeometryUtil && L.GeometryUtil.geodesicArea) {
      const latlngs = layer.getLatLngs();
      // polygon rings are nested arrays; rectangle returns a flat array
      const ring = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
      return L.GeometryUtil.geodesicArea(ring);
    }
  } catch (e) {
    void e;
  }
  return 0;
}

/* ── Inner map helpers ─────────────────────────────────────────────────────── */

/**
 * Mounts leaflet-draw controls once. Uses a stable FeatureGroup ref so the
 * drawn polygon survives parent re-renders. Callbacks are stored in refs so
 * the effect never needs to re-run just because a callback changed.
 */
function DrawControl({ onDraw, onClear }) {
  const map        = useMap();
  const onDrawRef  = useRef(onDraw);
  const onClearRef = useRef(onClear);
  // stable container for drawn layers — NOT recreated on re-render
  const drawnRef   = useRef(null);

  // keep callback refs current without re-running the setup effect
  useEffect(() => { onDrawRef.current  = onDraw;  }, [onDraw]);
  useEffect(() => { onClearRef.current = onClear; }, [onClear]);

  useEffect(() => {
    if (!L.Control || !L.Control.Draw) return;

    // create the FeatureGroup once and keep it in a ref
    const drawnItems = new L.FeatureGroup();
    drawnRef.current = drawnItems;
    map.addLayer(drawnItems);

    const drawCtrl = new L.Control.Draw({
      position: "topright",
      edit: { featureGroup: drawnItems, remove: true },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color:       "#10b981",
            fillColor:   "#10b981",
            fillOpacity: 0.3,
            weight:      2,
          },
          guidelineDistance: 20,
          metric: true,
        },
        rectangle: {
          shapeOptions: {
            color:       "#10b981",
            fillColor:   "#10b981",
            fillOpacity: 0.3,
            weight:      2,
          },
        },
        polyline:     false,
        circle:       false,
        marker:       false,
        circlemarker: false,
      },
    });

    map.addControl(drawCtrl);

    const onCreate = (e) => {
      // only one polygon allowed — clear previous before adding
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);
      onDrawRef.current(e.layer.toGeoJSON(), calcAreaM2(e.layer));
    };

    const onEdited = () => {
      // after edit, read the single layer still in drawnItems
      const layers = drawnItems.getLayers();
      if (layers.length > 0) {
        const layer = layers[0];
        onDrawRef.current(layer.toGeoJSON(), calcAreaM2(layer));
      }
    };

    const onDeleted = () => {
      if (drawnItems.getLayers().length === 0) {
        onClearRef.current();
      }
    };

    map.on(L.Draw.Event.CREATED,  onCreate);
    map.on(L.Draw.Event.EDITED,   onEdited);
    map.on(L.Draw.Event.DELETED,  onDeleted);

    return () => {
      map.removeControl(drawCtrl);
      map.removeLayer(drawnItems);
      drawnRef.current = null;
      map.off(L.Draw.Event.CREATED,  onCreate);
      map.off(L.Draw.Event.EDITED,   onEdited);
      map.off(L.Draw.Event.DELETED,  onDeleted);
    };
  }, [map]); // intentionally only [map] — callbacks are in refs

  return null;
}

/** Imperatively flies to a target district (or null) when it changes.
 *  Also watches a locFlyRef for one-shot location search results.
 */
function FlyTo({ district, locFlyRef }) {
  const map = useMap();
  const prevDistRef = useRef(null);
  useEffect(() => {
    if (!district || district === prevDistRef.current) return;
    prevDistRef.current = district;
    map.flyTo(district.center, district.zoom, { animate: true, duration: 1.5 });
  }, [map, district]);

  // Watch locFlyRef for one-shot fly-to from location search
  useEffect(() => {
    // expose a callback so flyToResult can trigger an imperative fly
    locFlyRef.current = (center, zoom) => {
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    };
    return () => { locFlyRef.current = null; };
  }, [map, locFlyRef]);

  return null;
}

/**
 * Shows an existing polygon as a static read-only layer and fits bounds on mount.
 */
function ReadOnlyFeature({ feature: geoFeature }) {
  const map = useMap();
  useEffect(() => {
    if (!geoFeature) return;
    const layer = L.geoJSON(geoFeature, {
      style: {
        color:       "#10b981",
        fillColor:   "#10b981",
        fillOpacity: 0.25,
        weight:      2,
      },
    });
    map.addLayer(layer);
    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [60, 60] });
    return () => map.removeLayer(layer);
  }, [map, geoFeature]);
  return null;
}

/* ── Main component ─────────────────────────────────────────────────────────── */

export default function FieldDrawMap({
  onDraw,
  onClear,
  onFieldNameChange,
  fieldName = "",
  initialFeature,
  readOnly = false,
  height   = "480px",
}) {
  const [selectedDistrict,  setSelectedDistrict]  = useState(null);
  const [paddyGeoJSON,      setPaddyGeoJSON]       = useState(null);
  const [loadingGeoJSON,    setLoadingGeoJSON]     = useState(false);
  const [basemap,           setBasemap]            = useState("satellite");

  /* district search */
  const [districtSearch,    setDistrictSearch]     = useState("");
  const [showDistrictMenu,  setShowDistrictMenu]   = useState(false);

  /* location search (Nominatim) */
  const [locSearch,         setLocSearch]          = useState("");
  const [locResults,        setLocResults]         = useState([]);
  const locDebounce = useRef(null);

  /* drawn state for area/price strip */
  const [acres, setAcres] = useState(0);
  const [hasPolygon, setHasPolygon] = useState(false);

  /* ref for imperative fly-to from location search */
  const locFlyRef = useRef(null);

  /* ── Load paddy GeoJSON when district changes ── */
  useEffect(() => {
    if (!selectedDistrict) {
      // defer to avoid synchronous setState inside effect
      const t = setTimeout(() => setPaddyGeoJSON(null), 0);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) setLoadingGeoJSON(true);
    }, 0);
    fetch(`/${selectedDistrict.file}.geojson`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) { setPaddyGeoJSON(data); setLoadingGeoJSON(false); }
      })
      .catch(() => { if (!cancelled) setLoadingGeoJSON(false); });
    return () => { cancelled = true; clearTimeout(t); };
  }, [selectedDistrict]);

  /* ── Callbacks for DrawControl ── */
  const handleDraw = useCallback(
    (feature, areaM2) => {
      const calcAcres = areaM2 / SQM_PER_ACRE;
      setAcres(calcAcres);
      setHasPolygon(true);
      if (onDraw) onDraw(feature, calcAcres, selectedDistrict?.name || "");
    },
    [onDraw, selectedDistrict?.name]
  );

  const handleClear = useCallback(() => {
    setAcres(0);
    setHasPolygon(false);
    if (onClear) onClear();
  }, [onClear]);

  /* ── Nominatim search ── */
  const searchLocation = (q) => {
    setLocSearch(q);
    clearTimeout(locDebounce.current);
    if (q.length < 3) { setLocResults([]); return; }
    locDebounce.current = setTimeout(async () => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            q + " Sri Lanka"
          )}&format=json&limit=5&countrycodes=lk`
        );
        const data = await res.json();
        setLocResults(data);
      } catch (e) {
        void e;
      }
    }, 500);
  };

  const flyToResult = (r) => {
    if (locFlyRef.current) locFlyRef.current([parseFloat(r.lat), parseFloat(r.lon)], 14);
    setLocSearch(r.display_name.split(",")[0]);
    setLocResults([]);
  };

  const filteredDistricts = DISTRICTS.filter((d) =>
    d.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const price = Math.ceil(acres * PRICE_PER_ACRE_LKR);

  /* ── Render ── */
  return (
    <div className="flex flex-col gap-3" style={{ minHeight: height }}>
      {/* ── Controls row ── */}
      {!readOnly && (
        <div className="flex flex-wrap gap-2 items-start">
          {/* District selector */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white text-sm w-48 cursor-pointer hover:border-emerald-500/50 transition-all"
              onClick={() => setShowDistrictMenu((v) => !v)}>
              <span className="material-symbols-outlined text-emerald-400 text-base">location_on</span>
              <span className={selectedDistrict ? "text-white font-semibold" : "text-white/40"}>
                {selectedDistrict ? selectedDistrict.name : "Select district"}
              </span>
              <span className="material-symbols-outlined text-white/30 text-base ml-auto">expand_more</span>
            </div>

            {showDistrictMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-slate-900 border border-white/15 rounded-xl shadow-2xl overflow-hidden" style={{ zIndex: 1002 }}>
                <div className="p-2 border-b border-white/10">
                  <input
                    autoFocus
                    type="text"
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    placeholder="Filter districts..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <ul className="max-h-48 overflow-y-auto">
                  {filteredDistricts.map((d) => (
                    <li
                      key={d.file}
                      onClick={() => {
                        setSelectedDistrict(d);
                        setDistrictSearch("");
                        setShowDistrictMenu(false);
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                        selectedDistrict?.file === d.file
                          ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                          : "text-white/80 hover:bg-white/5"
                      }`}
                    >
                      {d.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Location search */}
          <div className="relative flex-1 min-w-45">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 bg-white/5">
              <span className="material-symbols-outlined text-white/40 text-base">search</span>
              <input
                type="text"
                value={locSearch}
                onChange={(e) => searchLocation(e.target.value)}
                placeholder="Search location in Sri Lanka…"
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
              />
              {locSearch && (
                <button
                  onClick={() => { setLocSearch(""); setLocResults([]); }}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>
            {locResults.length > 0 && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-slate-900 border border-white/15 rounded-xl shadow-2xl max-h-44 overflow-y-auto" style={{ zIndex: 1002 }}>
                {locResults.map((r) => (
                  <li
                    key={r.place_id}
                    onClick={() => flyToResult(r)}
                    className="px-4 py-2.5 text-xs text-white/80 hover:bg-white/5 cursor-pointer truncate"
                  >
                    {r.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Basemap switcher */}
          <div className="flex gap-1 flex-wrap">
            {Object.entries(BASE_MAPS).map(([key, bm]) => (
              <button
                key={key}
                onClick={() => setBasemap(key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  basemap === key
                    ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {bm.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Field name input ── */}
      {!readOnly && (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-white/40 text-base shrink-0">badge</span>
          <input
            type="text"
            value={fieldName}
            onChange={(e) => onFieldNameChange?.(e.target.value)}
            placeholder="Name your field (e.g. North Paddy, Home Field…)"
            className="flex-1 px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/50 transition-all"
          />
        </div>
      )}

      {/* ── Area / Price strip ── */}
      {!readOnly && hasPolygon && (
        <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-base">straighten</span>
            <span className="text-white/70">Area:</span>
            <span className="font-black text-emerald-400">{acres.toFixed(3)} acres</span>
            <span className="text-white/30">({(acres * 4046.86).toFixed(0)} m²)</span>
          </div>
          <span className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-base">paid</span>
            <span className="text-white/70">Price:</span>
            <span className="font-black text-emerald-400">Rs. {price.toLocaleString()} / year</span>
            <span className="text-white/30 text-xs">(Rs. {PRICE_PER_ACRE_LKR.toLocaleString()} per acre)</span>
          </div>
        </div>
      )}

      {/* ── Map container ── */}
      <div
        className="relative rounded-xl overflow-hidden border border-white/10 flex-1"
        style={{ height }}
        onClick={() => setShowDistrictMenu(false)}
      >
        {loadingGeoJSON && (
          <div className="absolute inset-0 z-999 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        )}

        <MapContainer
          center={SL_CENTER}
          zoom={7}
          style={{ width: "100%", height: "100%" }}
          zoomControl
        >
          <TileLayer
            key={basemap}
            url={BASE_MAPS[basemap].url}
            attribution={BASE_MAPS[basemap].attribution}
          />

          {/* Paddy extent overlay (amber, shows known paddy zones) */}
          {paddyGeoJSON && (
            <GeoJSON
              key={selectedDistrict?.file}
              data={paddyGeoJSON}
              style={{
                fillColor:   "#f59e0b",
                fillOpacity: 0.4,
                color:       "#b45309",
                weight:      1,
              }}
            />
          )}

          {/* Read-only existing feature */}
          {readOnly && initialFeature && (
            <ReadOnlyFeature feature={initialFeature} />
          )}

          {/* Reference layer in edit mode (dashed blue) */}
          {!readOnly && initialFeature && (
            <GeoJSON
              key="reference-layer"
              data={initialFeature}
              style={{
                color:       "#3b82f6",
                fillColor:   "#3b82f6",
                fillOpacity: 0.10,
                weight:      2,
                dashArray:   "6,4",
              }}
            />
          )}

          {/* Draw tools */}
          {!readOnly && <DrawControl onDraw={handleDraw} onClear={handleClear} />}

          {/* Fly to controller */}
          <FlyTo district={selectedDistrict} locFlyRef={locFlyRef} />
        </MapContainer>
      </div>

      {/* Hint text */}
      {!readOnly && (
        <p className="text-xs text-white/30 text-center">
          <span className="text-amber-400/70">■</span> Yellow = known paddy areas &nbsp;·&nbsp;
          Use the <strong className="text-white/50">polygon / rectangle tool</strong> (top-right of map) to outline your field &nbsp;·&nbsp;
          {initialFeature && <span><span className="text-blue-400/70">⬝</span> Dashed blue = your current field</span>}
        </p>
      )}
    </div>
  );
}
