import fs from 'fs';
import path from 'path';

// Run this script from the project root: node simplify-geojson.js

const inputPath = path.join(import.meta.dirname, 'src', 'Components', 'assets', 'DSdevisions.geojson');
const outputPath = path.join(import.meta.dirname, 'public', 'ds-divisions-lite.json');

console.log(`Reading from: ${inputPath}`);

fs.readFile(inputPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading input file:', err);
        return;
    }

    try {
        const geojson = JSON.parse(data);

        // Reduce coordinate precision to ~11 meters (4 decimal places)
        const factor = Math.pow(10, 4);
        const roundCoords = (point) => [
            Math.round(point[0] * factor) / factor,
            Math.round(point[1] * factor) / factor
        ];

        const processRings = (rings) => rings.map(ring => ring.map(roundCoords));

        // Simplify features
        const simplifiedFeatures = geojson.features.map(f => {
            // 1. Keep only essential properties
            const props = {
                ds: f.properties.adm3_name, // DS Division name
                dist: f.properties.adm2_name // District name
            };

            // 2. Round coordinates based on geometry type
            let newGeom = { type: f.geometry.type, coordinates: [] };
            if (f.geometry.type === 'Polygon') {
                newGeom.coordinates = processRings(f.geometry.coordinates);
            } else if (f.geometry.type === 'MultiPolygon') {
                newGeom.coordinates = f.geometry.coordinates.map(processRings);
            } else {
                newGeom.coordinates = f.geometry.coordinates; // Fallback
            }

            return {
                type: 'Feature',
                properties: props,
                geometry: newGeom
            };
        });

        const outputObj = {
            type: 'FeatureCollection',
            features: simplifiedFeatures
        };

        const outputStr = JSON.stringify(outputObj);

        fs.writeFile(outputPath, outputStr, 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing output file:', writeErr);
            } else {
                const originalMb = (data.length / 1024 / 1024).toFixed(2);
                const newMb = (outputStr.length / 1024 / 1024).toFixed(2);
                console.log(`Success! Simplified GeoJSON from ${originalMb}MB to ${newMb}MB.`);
                console.log(`Saved to: ${outputPath}`);
            }
        });

    } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
    }
});
