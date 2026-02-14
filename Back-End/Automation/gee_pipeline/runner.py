# Automation/gee_pipeline/runner.py

import ee
import calendar
import time
from .auth import initialize_gee


def run_weekly_exports(years, roi_asset, district_name):

    initialize_gee()

    roi = ee.FeatureCollection(roi_asset)
    print("Total polygons:", roi.size().getInfo())

    for year in years:
        print("\n==============================")
        print(f"Processing Year: {year}")
        print("==============================")

        base_images = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(roi)
            .filterDate(f"{year}-01-01", f"{year}-12-31")
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 50))
        )

        for month in range(1, 13):

            last_day = calendar.monthrange(year, month)[1]

            week_ranges = [
                (1, 7),
                (8, 14),
                (15, 21),
                (22, last_day)
            ]

            print(f"\n📆 {year}-{month:02d}")

            for w_idx, (start_day, end_day) in enumerate(week_ranges, start=1):

                w_start = ee.Date.fromYMD(year, month, start_day)

                if end_day == last_day:
                    w_end = ee.Date.fromYMD(year, month, 1).advance(1, "month")
                else:
                    w_end = ee.Date.fromYMD(year, month, end_day + 1)

                weekly = base_images.filterDate(w_start, w_end)

                if weekly.size().getInfo() == 0:
                    print(f"  → Week {w_idx}: no valid image")
                    continue

                img = ee.Image(weekly.first())

                description = f"{district_name}_{year}_{month:02d}_W{w_idx}"

                print(f"  → Week {w_idx}: submitting export")

                table = img.select(["B4", "B8"]).sample(
                    region=roi.geometry(),
                    scale=10,
                    numPixels=1000,
                    geometries=True
                )

                task = ee.batch.Export.table.toDrive(
                    collection=table,
                    description=description,
                    folder="ricevision_exports",   # must be shared
                    fileNamePrefix=description,
                    fileFormat="CSV"
                )

                task.start()

                print("     Submitted:", description)
                print("     Task ID:", task.id)

                time.sleep(3)
                print("     Status:", task.status()["state"])

    print("\n✅ ALL EXPORT TASKS SUBMITTED")
