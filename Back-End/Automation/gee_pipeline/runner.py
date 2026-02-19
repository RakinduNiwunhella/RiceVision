import ee
from datetime import datetime
from Automation.utils.task_monitor import wait_for_task
from Automation.utils.ee_downloader import download_ee_csv
from .auth import initialize_gee


def run_national_10_timesteps():

    initialize_gee()

    run_id = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    grid_scale = 500

    print("\n==============================")
    print("NATIONAL 10-TIMESTEP CSV PIPELINE")
    print("Run ID:", run_id)
    print("==============================\n")

    # -----------------------------------------
    # Sri Lanka Boundary
    # -----------------------------------------
    country = (
        ee.FeatureCollection("FAO/GAUL/2015/level0")
        .filter(ee.Filter.eq("ADM0_NAME", "Sri Lanka"))
    )

    region = country.geometry()

    # -----------------------------------------
    # Sentinel-2 Collection
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

    for i in range(10):

        print(f"Processing timestep {i+1}/10")

        img = ee.Image(image_list.get(i))
        date_start = ee.Date(img.get("system:time_start"))
        date_str = date_start.format("YYYY-MM-dd")

        # -----------------------------------------
        # Sentinel-2 Bands
        # -----------------------------------------
        base = img.select([
            "B1","B2","B3","B4","B5","B6",
            "B7","B8","B8A","B9","B11","B12","SCL"
        ])

        # -----------------------------------------
        # Safe Rainfall
        # -----------------------------------------
        def safe_rain(days):
            rain_coll = chirps.filterDate(
                date_start.advance(-days, "day"),
                date_start
            )
            return ee.Image(
                ee.Algorithms.If(
                    rain_coll.size().gt(0),
                    rain_coll.sum(),
                    ee.Image.constant(-9999)
                )
            ).rename(f"rain_{days}d")

        rain_stack = ee.Image.cat([
            safe_rain(1),
            safe_rain(3),
            safe_rain(7),
            safe_rain(14),
            safe_rain(30)
        ])

        # -----------------------------------------
        # Safe Climate (ERA5)
        # -----------------------------------------
        era_day = era5.filterDate(
            date_start,
            date_start.advance(1, "day")
        )

        def safe_stat(collection, band, reducer, name):
            return ee.Image(
                ee.Algorithms.If(
                    collection.size().gt(0),
                    collection.select(band).reduce(reducer),
                    ee.Image.constant(-9999)
                )
            ).rename(name)

        tmean = safe_stat(era_day, "temperature_2m",
                          ee.Reducer.mean(), "tmean").subtract(273.15)

        tmin = safe_stat(era_day, "temperature_2m",
                         ee.Reducer.min(), "tmin").subtract(273.15)

        tmax = safe_stat(era_day, "temperature_2m",
                         ee.Reducer.max(), "tmax").subtract(273.15)

        day = era_day.filter(
            ee.Filter.calendarRange(6, 18, "hour")
        )

        night = era_day.filter(
            ee.Filter.Or(
                ee.Filter.calendarRange(18, 23, "hour"),
                ee.Filter.calendarRange(0, 6, "hour")
            )
        )

        t_day = safe_stat(day, "temperature_2m",
                          ee.Reducer.mean(), "t_day").subtract(273.15)

        t_night = safe_stat(night, "temperature_2m",
                            ee.Reducer.mean(), "t_night").subtract(273.15)

        td = safe_stat(era_day, "dewpoint_temperature_2m",
                       ee.Reducer.mean(), "Td")

        rh_mean = ee.Image(
            ee.Algorithms.If(
                era_day.size().gt(0),
                ee.Image(100).multiply(
                    td.expression(
                        "exp((17.625*Td)/(243.04+Td)) / exp((17.625*T)/(243.04+T))",
                        {"Td": td, "T": tmean}
                    )
                ),
                ee.Image.constant(-9999)
            )
        ).rename("rh_mean")

        climate_stack = ee.Image.cat([
            t_day, t_night, tmax, tmean, tmin, rh_mean
        ])

        # -----------------------------------------
        # Final Stack
        # -----------------------------------------
        final_stack = (
            base
            .addBands(terrain)
            .addBands(rain_stack)
            .addBands(climate_stack)
            .toFloat()
            .clip(region)
        )

        # -----------------------------------------
        # Sample to Table
        # -----------------------------------------
        points = final_stack.sample(
            region=region,
            scale=grid_scale,
            geometries=True
        )

        # -----------------------------------------
        # Add Pixel ID + Metadata (ONLY NEW ADDITION)
        # -----------------------------------------
        def add_metadata(f):
            coords = f.geometry().coordinates()
            lon = coords.get(0)
            lat = coords.get(1)

            lon_r = ee.Number(lon).format('%.6f')
            lat_r = ee.Number(lat).format('%.6f')

            pixel_id = ee.String(lat_r).cat("_").cat(lon_r)

            return f.set({
                "pixel_id": pixel_id,
                "cloud_pct": img.get("CLOUDY_PIXEL_PERCENTAGE"),
                "date": date_str,
                "lat": lat,
                "lon": lon
            })

        points = points.map(add_metadata)

        # -----------------------------------------
        # Column Order
        # -----------------------------------------
        columns = [
            "pixel_id",
            "system:index",
            "B1","B11","B12","B2","B3","B4","B5","B6",
            "B7","B8","B8A","B9",
            "SCL",
            "cloud_pct",
            "date",
            "elevation",
            "lat","lon",
            "rain_14d","rain_1d","rain_30d","rain_3d","rain_7d",
            "rh_mean",
            "slope",
            "t_day","t_night","tmax","tmean","tmin",
            ".geo"
        ]

        points = points.select(columns)

        export_name = f"national_csv_t{i+1}_{run_id}"
        asset_id = f"projects/ricevision-487310/assets/national_exports/{export_name}"

        task = ee.batch.Export.table.toAsset(
            collection=points,
            description=export_name,
            assetId=asset_id
        )

        task.start()
        wait_for_task(task)

        table = ee.FeatureCollection(asset_id)
        url = table.getDownloadURL(filetype="CSV")
        output_path = f"downloads/{export_name}.csv"
        download_ee_csv(url, output_path)

        print("-----------------------------------")

    print("\nAll 10 timesteps completed successfully.\n")
