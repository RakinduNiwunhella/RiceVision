from __future__ import annotations

from typing import Tuple

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

from .bilstm_prepare import create_inference_sequences


def weighted_stage_ce_v2(y_true, y_pred):
    y_true = tf.cast(tf.reshape(y_true, [-1]), tf.int32)
    class_weights = tf.constant([3.0, 1.5, 4.0, 1.5, 1.0], dtype=tf.float32)
    weights = tf.gather(class_weights, y_true)
    loss = tf.keras.losses.sparse_categorical_crossentropy(y_true, y_pred)
    return tf.reduce_mean(loss * weights)


def robust_huber_loss(y_true, y_pred):
    return tf.keras.losses.Huber(delta=1.0)(y_true, y_pred)


def regression_accuracy(y_true, y_pred):
    diff = tf.abs(tf.squeeze(y_true) - tf.squeeze(y_pred))
    return tf.reduce_mean(tf.cast(diff < 0.5, tf.float32))


def run_model_inference(df: pd.DataFrame, model_path: str, district_encoder_path: str, window_size: int = 10) -> pd.DataFrame:
    x_inf, meta = create_inference_sequences(df, window_size=window_size)
    if len(meta) == 0:
        return meta

    model = tf.keras.models.load_model(
        model_path,
        custom_objects={
            'weighted_stage_ce_v2': weighted_stage_ce_v2,
            'robust_huber_loss': robust_huber_loss,
            'regression_accuracy': regression_accuracy,
        },
    )

    preds = model.predict(
        [x_inf['temporal_input'], x_inf['static_input'], x_inf['district_input']],
        verbose=0,
    )

    out = meta.copy()
    out['pred_stage_id'] = np.argmax(preds[0], axis=1)
    out['pred_health_z'] = preds[1].flatten()
    out['pred_pest_cpi'] = preds[2].flatten()
    out['final_health_impact'] = out['pred_health_z'] * out['is_growing']
    out['final_pest_impact'] = out['pred_pest_cpi'] * out['is_growing']

    stage_rev_map = {0: 'Transplant', 1: 'Vegetative', 2: 'Reproductive', 3: 'Ripening', 4: 'Harvest'}
    out['pred_stage_name'] = out['pred_stage_id'].map(stage_rev_map)

    if 'district' not in out.columns:
        encoder = joblib.load(district_encoder_path)
        out['district'] = encoder.inverse_transform(out['district_id'])

    return out


def categorize_inference_results(meta_df: pd.DataFrame) -> pd.DataFrame:
    out = meta_df.copy()

    def get_health_label(row):
        if row['pred_stage_name'] in ['Transplant', 'Harvest']:
            return 'Not Applicable'
        z_value = row['pred_health_z']
        if z_value > 1.0:
            return 'Healthy'
        if -1.0 <= z_value <= 1.0:
            return 'Normal'
        if -2.0 <= z_value < -1.0:
            return 'Mild Stress'
        return 'Severe Stress'

    out['health_category'] = out.apply(get_health_label, axis=1)

    pest_stats = (
        out.groupby('pred_stage_name')['pred_pest_cpi']
        .agg(['median', 'std', lambda x: x.quantile(0.95)])
        .reset_index()
    )
    pest_stats.columns = ['pred_stage_name', 'cpi_med', 'cpi_std', 'cpi_q95']
    out = out.merge(pest_stats, on='pred_stage_name', how='left')

    def detect_pest_flag(row):
        if row['pred_stage_name'] in ['Transplant', 'Harvest']:
            return 0
        is_local_anomaly = row['pred_pest_cpi'] >= row['cpi_q95']
        is_global_anomaly = row['pred_pest_cpi'] > (row['cpi_med'] + (1.5 * row['cpi_std']))
        return 1 if (is_local_anomaly and is_global_anomaly) else 0

    out['pest_flag'] = out.apply(detect_pest_flag, axis=1)
    out = out.drop(columns=['cpi_med', 'cpi_std', 'cpi_q95'])
    return out


def generate_ricevision_report(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    report_df = df.copy()
    report_df['date'] = pd.to_datetime(report_df['date'])
    latest_date = report_df['date'].max()

    latest_df = report_df[report_df['date'] == latest_date].copy()

    district_report = latest_df.groupby('district').agg(
        total_pixels=('pixel_id', 'count'),
        severe_stress_pct=('health_category', lambda x: (x == 'Severe Stress').mean() * 100),
        pest_attack_count=('pest_flag', 'sum'),
        most_common_stage=('pred_stage_name', lambda x: x.value_counts().index[0]),
    ).reset_index()

    district_report['risk_score'] = (
        district_report['severe_stress_pct'] * 0.7
        + (district_report['pest_attack_count'] / district_report['total_pixels'] * 30)
    )
    district_report = district_report.sort_values('risk_score', ascending=False)

    trend_report = report_df.groupby('date').agg(
        avg_z_score=('pred_health_z', 'mean'),
        pest_incidence=('pest_flag', 'mean'),
    ).reset_index()

    days_to_harvest = {
        'Transplant': 100,
        'Vegetative': 70,
        'Reproductive': 40,
        'Ripening': 15,
        'Harvest': 0,
    }

    latest_df['est_harvest_date'] = latest_df['pred_stage_name'].map(days_to_harvest)
    latest_df['est_harvest_date'] = pd.to_timedelta(latest_df['est_harvest_date'], unit='D') + latest_df['date']
    forecast_report = latest_df.groupby('district')['est_harvest_date'].median().reset_index()

    return district_report, trend_report, forecast_report