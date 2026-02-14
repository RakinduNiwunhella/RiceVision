# scripts/run_gee.py

from gee_pipeline.runner import run_weekly_exports

if __name__ == "__main__":
    run_weekly_exports(
        years=[2025],
        roi_asset="projects/ricevision/assets/Ampara_paddy2",
        district_name="Ampara"
    )
