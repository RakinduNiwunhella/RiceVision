
from satellite.gee_pipeline.runner import run_national_inference_pipeline
from satellite.scripts.combine_csvs import combine_timestep_csvs


def run_pipeline():

    print("=== SATELLITE PIPELINE STARTED ===")

    # Step 1: Run GEE export (10 timesteps)
    run_national_inference_pipeline()

    # Step 2: Combine exported CSVs + add district columns
    combine_timestep_csvs()

    print("=== SATELLITE PIPELINE COMPLETED ===")


if __name__ == "__main__":
    run_pipeline()