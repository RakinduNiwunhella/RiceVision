DISTRICT_CENTERS = {
    'Ampara': (7.28, 81.67), 'Anuradhapura': (8.31, 80.41), 'Badulla': (6.99, 81.05),
    'Batticaloa': (7.71, 81.70), 'Colombo': (6.92, 79.86), 'Galle': (6.05, 80.22),
    'Gampaha': (7.08, 80.00), 'Hambantota': (6.14, 81.12), 'Jaffna': (9.66, 80.01),
    'Kaluthara': (6.58, 79.96), 'Kandy': (7.29, 80.63), 'Kegalle': (7.25, 80.34),
    'Kilinochchi': (9.38, 80.40), 'Kurunegala': (7.48, 80.36), 'Mannar': (8.98, 79.91),
    'Matale': (7.46, 80.62), 'Matara': (5.94, 80.53), 'Monaragala': (6.87, 81.35),
    'Mullaitivu': (9.27, 80.81), 'Nuwara Eliya': (6.97, 80.78), 'Polonnaruwa': (7.94, 81.00),
    'Puttalam': (8.03, 79.82), 'Ratnapura': (6.68, 80.40), 'Trincomalee': (8.57, 81.23),
    'Vavuniya': (8.75, 80.50),
}

STAGE_MAPPING = {'Transplant': 0, 'Vegetative': 1, 'Reproductive': 2, 'Ripening': 3, 'Harvest': 4}

FINAL_TARGET_COLUMNS = [
    'pixel_id', 'year', 'date', 'month', 'season', 'season_id', 'cycle_id',
    'district', 'district_id', 'lat', 'lon', 'elevation', 'slope',
    'rain_1d_mean', 'rain_3d_mean', 'rain_7d_mean', 'rain_14d_mean',
    'rain_30d_mean', 'tmean_mean', 'tmax_mean', 'tmin_mean',
    't_day_mean', 't_night_mean', 'rh_mean_mean',
    'ten_day_start', 'delta_days', 'doy', 'doy_sin', 'doy_cos',
    'ndvi_median_smooth', 'evi_median_smooth', 'evi2_median_smooth',
    'lswi_median_smooth', 'ndwi_median_smooth', 'gli_median_smooth',
    'gci_median_smooth', 'cvi_median_smooth', 'sipi_median_smooth',
    'rendvi_median_smooth', 'reci_median_smooth', 'ccci_median_smooth',
    's2rep_median_smooth', 'bsi_median_smooth', 'npcri_median_smooth',
    'ndsmi_median_smooth',
    'ndvi_vel', 'lswi_vel', 'bsi_vel',
    'stage_name', 'stage', 'ndvi_zscore', 'ndvi_vel_z', 'bsi_z', 'lswi_vel_z', 'cpi',
    'hazard_drought', 'hazard_flood', 'hazard_heavy_rain',
    'hazard_landslide', 'hazard_lightning', 'hazard_wind',
]
