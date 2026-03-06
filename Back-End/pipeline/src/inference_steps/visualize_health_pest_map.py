from pathlib import Path
import logging

import matplotlib.pyplot as plt
import pandas as pd

logger = logging.getLogger(__name__)


def visualize_health_pest_map(
    results_df: pd.DataFrame,
    artifacts_dir: str | Path,
    filename: str = 'health_pest_snapshot.png',
) -> Path:
    results_df = results_df.copy()
    results_df['date'] = pd.to_datetime(results_df['date'])
    latest_status = results_df.sort_values('date').groupby('pixel_id').tail(1)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 8))

    health_colors = {
        'Healthy': '#006400',
        'Normal': '#32CD32',
        'Mild Stress': '#FFA500',
        'Severe Stress': '#FF0000',
        'Not Applicable': '#D3D3D3',
    }

    for category, color in health_colors.items():
        subset = latest_status[latest_status['health_category'] == category]
        if not subset.empty:
            ax1.scatter(subset['lon'], subset['lat'], c=color, label=category, s=10, alpha=0.8, edgecolors='none')

    ax1.set_title('Sri Lanka: Predicted Crop Health', fontsize=15, pad=10)
    ax1.legend(title='Health Status', loc='upper right', markerscale=2, frameon=True, framealpha=0.9)
    ax1.set_xlabel('Longitude')
    ax1.set_ylabel('Latitude')
    ax1.grid(True, linestyle='--', alpha=0.3)
    ax1.set_aspect('equal')

    pest_colors = {
        0: ('#2E8B57', 'No Attack', 0.4),
        1: ('#800080', 'Pest Attack', 1.0),
    }

    for flag, (color, label, alpha) in pest_colors.items():
        subset = latest_status[latest_status['pest_flag'] == flag]
        if not subset.empty:
            ax2.scatter(
                subset['lon'],
                subset['lat'],
                c=color,
                label=label,
                s=12 if flag == 1 else 6,
                alpha=alpha,
                edgecolors='none',
            )

    ax2.set_title('Sri Lanka: Predicted Pest Attacks (CPI)', fontsize=15, pad=10)
    ax2.legend(title='Pest Status', loc='upper right', markerscale=2, frameon=True, framealpha=0.9)
    ax2.set_xlabel('Longitude')
    ax2.grid(True, linestyle='--', alpha=0.3)
    ax2.set_aspect('equal')

    plt.tight_layout()
    current_date_str = latest_status['date'].max().strftime('%Y-%m-%d')
    plt.suptitle(f'RiceVision Inference Snapshot: {current_date_str}', fontsize=18, y=1.02)

    out_dir = Path(artifacts_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / filename
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    logger.info('Saved health/pest map to %s', out_path)
    return out_path
