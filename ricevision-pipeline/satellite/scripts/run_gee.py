
from satellite.gee_pipeline.runner import run_national_inference_pipeline
from satellite.scripts.combine_csvs import combine_timestep_csvs


if __name__ == "__main__":
    # Step 1: Run GEE export pipeline
    run_national_inference_pipeline()

    # Step 2: Combine exported CSVs and add districts
    combine_timestep_csvs()