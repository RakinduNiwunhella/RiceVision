# gee_pipeline/runner.py

import ee
import calendar
from .auth import initialize_gee

def run_weekly_exports(years, roi_asset, district_name):

    initialize_gee()

    roi = ee.FeatureCollection(roi_asset)
    print("Total polygons:", roi.size().getInfo())

    for year in years:
        print(f"\nProcessing {year}")

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

            for w_idx, (start_day, end_day) in enumerate(week_ranges, start=1):

                w_start = ee.Date.fromYMD(year, month, start_day)

                if end_day == last_day:
                    w_end = ee.Date.fromYMD(year, month, 1).advance(1, "month")
                else:
                    w_end = ee.Date.fromYMD(year, month, end_day + 1)

                weekly = base_images.filterDate(w_start, w_end)

                if weekly.size().getInfo() == 0:
                    continue

                img = ee.Image(weekly.first())

                print(f"Exporting {district_name} {year}-{month} W{w_idx}")

                # you can call export function here
