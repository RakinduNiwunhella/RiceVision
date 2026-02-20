import ee
from datetime import datetime
from Automation.gee_pipeline.auth import initialize_gee
from Automation.utils.task_monitor import wait_for_task


def run_national_10_timesteps():

    initialize_gee()

    run_id = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    grid_scale = 500

    print("\n==============================")
    print("PADDY ASSET 10-TIMESTEP PIPELINE")
    print("Run ID:", run_id)
    print("==============================\n")

    # -----------------------------------------
    # SAME FEATURECOLLECTION ASSET (unchanged)
    # -----------------------------------------
    paddy_asset = ee.FeatureCollection(
        "projects/ricevision-487918/assets/sri_lanka_districts"
    )

    region = ee.FeatureCollection("FAO/GAUL/2015/level0") \
        .filter(ee.Filter.eq("ADM0_NAME", "Sri Lanka")) \
        .geometry()

    # =========================================
    # 🔥 EXACT SAME RANDOM 5000 POINTS LOGIC
    # =========================================
    fixed_points = ee.FeatureCollection(
    "projects/ricevision-487918/assets/fixed_5000_paddy_points_sl_2"
    )

    def add_pixel_id(f):
        coords = f.geometry().coordinates()
        lon = coords.get(0)
        lat = coords.get(1)

        lon_r = ee.Number(lon).format('%.6f')
        lat_r = ee.Number(lat).format('%.6f')

        pixel_id = ee.String(lat_r).cat("_").cat(lon_r)

        return f.set({
            "pixel_id": pixel_id,
            "lat": lat,
            "lon": lon
        })

    fixed_points = fixed_points.map(add_pixel_id)

    # -----------------------------------------
    # Sentinel-2 (same as JS style)
    # -----------------------------------------
    s2 = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(region)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
        .sort("system:time_start", False)
        .limit(10)
    )

    image_list = s2.toList(10)

    dem = ee.Image("USGS/SRTMGL1_003")

    terrain = ee.Image([
        dem.rename("elevation"),
        ee.Terrain.slope(dem).rename("slope")
    ])

    chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
    era5 = ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY")

    # -----------------------------------------
    # LOOP TIMESTEPS (JS equivalent)
    # -----------------------------------------
    for i in range(10):

        print(f"Processing timestep {i+1}/10")

        img = ee.Image(image_list.get(i))
        date_start = ee.Date(img.get("system:time_start"))
        date_str = date_start.format("YYYY-MM-dd")

        base = img.select([
            "B1","B2","B3","B4","B5","B6",
            "B7","B8","B8A","B9","B11","B12","SCL"
        ])

        # ---------- RAIN (exact JS style) ----------
        def rain(days):
            return (
                chirps
                .filterDate(date_start.advance(-days, "day"), date_start)
                .sum()
                .rename(f"rain_{days}d")
            )

        rain_stack = ee.Image.cat([
            rain(1),
            rain(3),
            rain(7),
            rain(14),
            rain(30)
        ])

        # ---------- TEMPERATURE (exact JS logic) ----------
        era_day = era5.filterDate(
            date_start,
            date_start.advance(1, "day")
        )

        tmean = (
            era_day.select("temperature_2m")
            .mean()
            .subtract(273.15)
            .rename("tmean")
        )

        tmin = (
            era_day.select("temperature_2m")
            .min()
            .subtract(273.15)
            .rename("tmin")
        )

        tmax = (
            era_day.select("temperature_2m")
            .max()
            .subtract(273.15)
            .rename("tmax")
        )

        day = era_day.filter(
            ee.Filter.calendarRange(6, 18, "hour")
        )

        night = era_day.filter(
            ee.Filter.Or(
                ee.Filter.calendarRange(18, 23, "hour"),
                ee.Filter.calendarRange(0, 6, "hour")
            )
        )

        t_day = (
            day.select("temperature_2m")
            .mean()
            .subtract(273.15)
            .rename("t_day")
        )

        t_night = (
            night.select("temperature_2m")
            .mean()
            .subtract(273.15)
            .rename("t_night")
        )

        td = (
            era_day.select("dewpoint_temperature_2m")
            .mean()
            .subtract(273.15)
        )

        rh_mean = ee.Image(100).multiply(
            td.expression(
                "exp((17.625*Td)/(243.04+Td)) / exp((17.625*T)/(243.04+T))",
                {"Td": td, "T": tmean}
            )
        ).rename("rh_mean")

        climate_stack = ee.Image.cat([
            t_day, t_night, tmax, tmean, tmin, rh_mean
        ])

        final_stack = (
            base
            .addBands(terrain)
            .addBands(rain_stack)
            .addBands(climate_stack)
            .toFloat()
           
        )

        # 🔥 EXACT SAME sampling
        points = final_stack.sampleRegions(
            collection=fixed_points,
            scale=grid_scale,
            geometries=True
        )

        points = points.map(lambda f: f.set({
            "cloud_pct": img.get("CLOUDY_PIXEL_PERCENTAGE"),
            "date": date_str
        }))

        export_name = f"districts_csv_t{i+1}_{run_id}"

        task = ee.batch.Export.table.toCloudStorage(
            collection=points,
            description=export_name,
            bucket="ricevision-gee-exports",
            fileNamePrefix=f"district_exports/{export_name}",
            fileFormat="CSV"
        )

        task.start()
        wait_for_task(task)

        print(f"{export_name} exported.")
        print("-----------------------------------")

    print("\nAll 10 timesteps exported successfully.\n")