from pathlib import Path
import logging

import matplotlib.pyplot as plt
import pandas as pd

logger = logging.getLogger(__name__)


def visualize_stage_map(
    results_df: pd.DataFrame,
    artifacts_dir: str | Path,
    filename: str = 'growth_stage_snapshot.png',
) -> Path:
    results_df = results_df.copy()
    results_df['date'] = pd.to_datetime(results_df['date'])
    latest_status = results_df.sort_values('date').groupby('pixel_id').tail(1)

    plt.figure(figsize=(8, 8))

    stage_colors = {
        'Transplant': '#00BFFF',
        'Vegetative': '#7CFC00',
        'Reproductive': '#228B22',
        'Ripening': '#FFD700',
        'Harvest': '#8B4513',
    }
    ordered_stages = ['Transplant', 'Vegetative', 'Reproductive', 'Ripening', 'Harvest']

    for stage in ordered_stages:
        if stage in stage_colors:
            color = stage_colors[stage]
            subset = latest_status[latest_status['pred_stage_name'] == stage]
            if not subset.empty:
                plt.scatter(subset['lon'], subset['lat'], c=color, label=stage, s=12, alpha=0.8, edgecolors='none')

    current_date_str = latest_status['date'].max().strftime('%Y-%m-%d')
    plt.title(f'Sri Lanka: Predicted Rice Growth Stages\nSnapshot: {current_date_str}', fontsize=15, pad=15)
    plt.legend(title='Phenological Stage', loc='upper right', markerscale=2, frameon=True, framealpha=0.9, fontsize=10)
    plt.xlabel('Longitude', fontsize=12)
    plt.ylabel('Latitude', fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.3)
    plt.gca().set_aspect('equal', adjustable='box')
    plt.tight_layout()

    out_dir = Path(artifacts_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / filename
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    logger.info('Saved stage map to %s', out_path)
    return out_path
