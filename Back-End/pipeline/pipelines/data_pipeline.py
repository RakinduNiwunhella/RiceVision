import logging
import os
from typing import Dict, Any

import pandas as pd

from src.data_ingestion import DataIngestorCSV
from src.data_spiltter import SimpleTrainTestSplitStratergy
from src.model_inference import ModelInference
from utils.mlflow_utils import MLflowTracker, create_mlflow_run_tags
import mlflow

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def data_pipeline(
    data_path: str = 'data/raw/inference_v1.csv',
    target_column: str = 'stage',
    test_size: float = 0.2,
    force_rebuild: bool = False,
    processed_path: str = 'artifacts/data/ricevision_features.csv',
    model_path: str = 'models/ricevision_v7_district_aware.keras',
    baseline_path: str = 'artifacts/sri_lanka_district_baselines.csv',
) -> Dict[str, Any]:
    if not os.path.exists(data_path):
        raise FileNotFoundError(f'Data file not found: {data_path}')

    os.makedirs(os.path.dirname(processed_path), exist_ok=True)

    if os.path.exists(processed_path) and not force_rebuild:
        processed_df = pd.read_csv(processed_path)
        return {'processed_df': processed_df, 'processed_path': processed_path, 'split': None}

    tracker = MLflowTracker()
    run = tracker.start_run(
        run_name='ricevision_data_pipeline',
        tags=create_mlflow_run_tags('data_pipeline', {'data_source': data_path}),
    )

    try:
        raw_df = DataIngestorCSV().ingest(data_path)
        inference = ModelInference(model_path=model_path, baseline_path=baseline_path)
        processed_df = inference.preprocess_dataframe(raw_df)

        processed_df.to_csv(processed_path, index=False)
        mlflow.log_artifact(processed_path, 'processed_datasets')
        mlflow.log_metrics({
            'raw_rows': len(raw_df),
            'processed_rows': len(processed_df),
            'processed_columns': processed_df.shape[1],
        })

        split_payload = None
        if target_column in processed_df.columns:
            splitter = SimpleTrainTestSplitStratergy(test_size=test_size)
            x_train, x_test, y_train, y_test = splitter.split_data(processed_df, target_column)

            x_train_path = 'artifacts/data/X_train.csv'
            x_test_path = 'artifacts/data/X_test.csv'
            y_train_path = 'artifacts/data/Y_train.csv'
            y_test_path = 'artifacts/data/Y_test.csv'

            x_train.to_csv(x_train_path, index=False)
            x_test.to_csv(x_test_path, index=False)
            pd.Series(y_train).to_csv(y_train_path, index=False)
            pd.Series(y_test).to_csv(y_test_path, index=False)

            split_payload = {
                'X_train': x_train_path,
                'X_test': x_test_path,
                'Y_train': y_train_path,
                'Y_test': y_test_path,
            }

        tracker.end_run()
        return {'processed_df': processed_df, 'processed_path': processed_path, 'split': split_payload}
    except Exception:
        tracker.end_run()
        raise


if __name__ == '__main__':
    data_pipeline()