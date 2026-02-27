import json
import logging
import os
import time
from typing import Dict, Any, Optional

import mlflow
import pandas as pd

from pipelines.data_pipeline import data_pipeline
from src.model_building import RiceVisionModelBuilder
from src.model_evaluation import ModelEvaluator
from src.model_training import ModelTrainer
from utils.mlflow_utils import MLflowTracker, create_mlflow_run_tags

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def training_pipeline(
    data_path: str = 'data/raw/inference_v1.csv',
    model_params: Optional[Dict[str, Any]] = None,
    test_size: float = 0.2,
    model_path: str = 'artifacts/models/ricevision_rf.joblib',
):
    pipeline_out = data_pipeline(data_path=data_path, target_column='stage', test_size=test_size, force_rebuild=False)
    processed_df = pipeline_out['processed_df']

    if 'stage' not in processed_df.columns:
        raise ValueError('Training requires stage labels. Generated dataset does not contain `stage`.')

    train_split = pipeline_out['split']
    if not train_split:
        raise ValueError('No train/test split produced by data pipeline.')

    x_train = pd.read_csv(train_split['X_train'])
    x_test = pd.read_csv(train_split['X_test'])
    y_train = pd.read_csv(train_split['Y_train']).squeeze()
    y_test = pd.read_csv(train_split['Y_test']).squeeze()

    numeric_train = x_train.select_dtypes(include=['number']).fillna(0)
    numeric_test = x_test.select_dtypes(include=['number']).fillna(0)

    tracker = MLflowTracker()
    tracker.start_run(
        run_name='ricevision_training_pipeline',
        tags=create_mlflow_run_tags('training_pipeline', {'model_path': model_path}),
    )

    try:
        start = time.time()
        builder = RiceVisionModelBuilder(**(model_params or {}))
        model = builder.build_model()

        trainer = ModelTrainer()
        model, train_score = trainer.train(model, numeric_train, y_train)
        trainer.save_model(model, model_path)

        evaluator = ModelEvaluator(model, 'RiceVisionRandomForest')
        metrics = evaluator.evaluate(numeric_test, y_test)

        elapsed = time.time() - start
        serializable_metrics = {k: (v.tolist() if hasattr(v, 'tolist') else v) for k, v in metrics.items()}

        mlflow.log_artifact(model_path, 'trained_models')
        mlflow.log_metrics({
            'train_score': float(train_score),
            'train_rows': len(numeric_train),
            'test_rows': len(numeric_test),
            'num_features': numeric_train.shape[1],
            'training_time_sec': elapsed,
            'accuracy': float(metrics['accuracy']),
            'f1': float(metrics['f1']),
            'precision': float(metrics['precision']),
            'recall': float(metrics['recall']),
        })

        summary = {
            'model_type': 'RiceVisionRandomForest',
            'model_path': model_path,
            'features': list(numeric_train.columns),
            'train_score': float(train_score),
            'metrics': serializable_metrics,
            'training_time_sec': elapsed,
        }
        os.makedirs('artifacts', exist_ok=True)
        summary_path = 'artifacts/ricevision_training_summary.json'
        with open(summary_path, 'w') as file:
            json.dump(summary, file, indent=2)
        mlflow.log_artifact(summary_path, 'training_summary')

        tracker.end_run()
        logger.info('RiceVision training pipeline completed.')
    except Exception:
        tracker.end_run()
        raise


if __name__ == '__main__':
    training_pipeline()