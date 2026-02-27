from merge.merge_pipeline import run_merge


def run_pipeline():
    print("=== MERGE PIPELINE STARTED ===")

    run_merge()

    print("=== MERGE PIPELINE COMPLETED ===")


if __name__ == "__main__":
    run_pipeline()