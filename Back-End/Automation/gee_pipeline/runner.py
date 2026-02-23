import ee
import time
from datetime import datetime
from Automation.gee_pipeline.auth import initialize_gee
from Automation.utils.task_monitor import wait_for_task

# Initialize GEE using your authentication module
initialize_gee()

def run_national_inference_pipeline():
    # ===================== 1. CONFIGURATION ===================== #
    run_id = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    grid_scale = 500  # 500m scale for national sampling
    bucket_name = "ricevision-gee-exports"
    
    # ROI: Whole of Sri Lanka
    roi = ee.FeatureCollection("FAO/GAUL/2015/level0") \
            .filter(ee.Filter.eq("ADM0_NAME", "Sri Lanka")).geometry()
            
    # Points: Your fixed 5000 paddy points asset
    points_asset = ee.FeatureCollection("projects/ricevision-487918/assets/fixed_5000_paddy_points_sl_2")

    # ===================== 2. UNIQUE PIXEL ID ASSIGNMENT ===================== #
    # Uses a hard limit of 5000 for the list to ensure server stability
    pts_list = points_asset.toList(5000)
    
    def assign_id(idx):
        idx = ee.Number(idx)
        f = ee.Feature(pts_list.get(idx))
        coords = f.geometry().coordinates()
        return f.set({
            "pixel_id": idx.toInt(),
            "lat": coords.get(1),
            "lon": coords.get(0)
        })
    
    indexed_points = ee.FeatureCollection(
        ee.List.sequence(0, 4999).map(assign_id)
    )

    # ===================== 3. BASE DATASETS ===================== #
    s2_col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED').filterBounds(roi)
    chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
    era5 = ee.ImageCollection('ECMWF/ERA5_LAND/HOURLY')
    dem = ee.Image('USGS/SRTMGL1_003')
    
    terrain = ee.Image.cat([
        dem.rename('elevation'), 
        ee.Terrain.slope(dem).rename('slope')
    ]).toFloat()

    # ===================== 4. PARALLEL EXPORT LOOP ===================== #
    today = ee.Date(datetime.now().strftime('%Y-%m-%d'))
    tasks = [] # List to keep track of all running tasks
    
    for i in range(10):
        # 15-day sliding window moving backwards
        t_end = today.advance(ee.Number(i).multiply(-15), 'day')
        t_start = t_end.advance(-15, 'day')
        
        # --- Sentinel-2 Median Mosaic ---
        s2_img = s2_col.filterDate(t_start, t_end).median() \
                       .select(['B1','B2','B3','B4','B5','B6','B7','B8','B8A','B9','B11','B12','SCL'])
        
        cloud_pct = s2_col.filterDate(t_start, t_end).aggregate_mean('CLOUDY_PIXEL_PERCENTAGE')

        # --- Rainfall (JS-style Rolling Windows) ---
        def get_rain(days):
            return chirps.filterDate(t_end.advance(ee.Number(days).multiply(-1), 'day'), t_end) \
                         .sum().rename(ee.String('rain_').cat(ee.Number(days).format('%dd')))

        rain_stack = ee.Image.cat([get_rain(1), get_rain(3), get_rain(7), get_rain(14), get_rain(30)])

        # --- Weather (ERA5 Temperature & Relative Humidity) ---
        era_period = era5.filterDate(t_start, t_end)
        tmean = era_period.select('temperature_2m').mean().subtract(273.15).rename('tmean')
        tmin = era_period.select('temperature_2m').min().subtract(273.15).rename('tmin')
        tmax = era_period.select('temperature_2m').max().subtract(273.15).rename('tmax')
        
        tday = era_period.filter(ee.Filter.calendarRange(6, 18, 'hour')).select('temperature_2m').mean().subtract(273.15).rename('t_day')
        tnight = era_period.filter(ee.Filter.Or(ee.Filter.calendarRange(18, 23, 'hour'), ee.Filter.calendarRange(0, 6, 'hour'))) \
                           .select('temperature_2m').mean().subtract(273.15).rename('t_night')

        td = era_period.select('dewpoint_temperature_2m').mean().subtract(273.15)
        rh = ee.Image(100).multiply(td.expression('exp((17.625*Td)/(243.04+Td)) / exp((17.625*T)/(243.04+T))', 
                                                 {'Td': td, 'T': tmean})).rename('rh_mean')

        # Combine all features into one stack
        final_stack = ee.Image.cat([s2_img, terrain, rain_stack, tmin, tmax, tmean, tday, tnight, rh]).toFloat()

        # Sample data at the 5000 points
        points = final_stack.sampleRegions(
            collection=indexed_points,
            scale=grid_scale,
            geometries=False
        ).map(lambda f: f.set({
            "timestep": i + 1,
            "date": t_end.format("YYYY-MM-dd"),
            "cloud_pct": cloud_pct,
            "constant": 1
        }))

        # ===================== 5. SUBMIT TO CLOUD STORAGE ===================== #
        export_name = f"districts_csv_t{i+1}_{run_id}"

        task = ee.batch.Export.table.toCloudStorage(
            collection=points,
            description=export_name,
            bucket=bucket_name,
            fileNamePrefix=f"district_exports/{export_name}",
            fileFormat="CSV"
        )

        # START THE TASK BUT DO NOT WAIT YET
        task.start()
        print(f"🚀 Task for timestep {i+1}/10 submitted to GEE queue: {export_name}")
        tasks.append((export_name, task))

    # ===================== 6. WAIT FOR ALL TASKS TO FINISH ===================== #
    print("\n⚡ All 10 tasks are now running in parallel on Google's servers.")
    print("⏳ Waiting for them to complete (expected time: 10-15 minutes)...\n")

    # Now we loop through the tasks and wait for them. Since they are processing 
    # simultaneously in the cloud, by the time we wait for Task 1, Tasks 2-10 are also finishing!
    for name, t in tasks:
        wait_for_task(t)
        print(f"✅ {name} finished!")

    print("\n🏁 All 10 timesteps exported successfully to GCS.\n")



if __name__ == "__main__":
    run_national_inference_pipeline()