# scripts/run_gee.py

from Automation.gee_pipeline.runner import run_weekly_exports


if __name__ == "__main__":
    run_weekly_exports(
        years=[2025],
        roi_asset="projects/ricevision-487310/assets/sri_lanka_districts",
        district_name="SriLanka"
)

