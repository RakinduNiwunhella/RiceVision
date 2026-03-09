// Check if a point (lon, lat) is inside a polygon ring
function pointInPolygon(point, vs) {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Find the corresponding feature in GeoJSON based on lon/lat
export async function getDSDivision(lat, lon) {
    try {
        const res = await fetch("/ds-divisions-lite.json");
        if (!res.ok) return null;

        const geojson = await res.json();
        const pt = [lon, lat]; // GeoJSON uses [longitude, latitude]

        for (const feature of geojson.features) {
            const geomType = feature.geometry.type;
            const coords = feature.geometry.coordinates;

            if (geomType === "Polygon") {
                for (const ring of coords) {
                    if (pointInPolygon(pt, ring)) {
                        return feature.properties;
                    }
                }
            } else if (geomType === "MultiPolygon") {
                for (const polygon of coords) {
                    for (const ring of polygon) {
                        if (pointInPolygon(pt, ring)) {
                            return feature.properties;
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error finding DS Division:", error);
    }

    return null;
}
