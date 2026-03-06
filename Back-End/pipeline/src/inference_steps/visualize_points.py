from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


def visualize_unique_points(
    full_dataset: pd.DataFrame,
    artifacts_dir: str | Path,
    image_name: str = 'sri_lanka_paddy_points.png',
) -> Path:
    unique_points = full_dataset.drop_duplicates(subset=['pixel_id'])

    plt.figure(figsize=(7, 10))
    plt.scatter(
        unique_points['lon'],
        unique_points['lat'],
        color='forestgreen',
        alpha=0.6,
        s=5,
    )

    plt.title('Distribution of 29228 Paddy Points in Sri Lanka', fontsize=14, pad=15)
    plt.xlabel('Longitude', fontsize=12)
    plt.ylabel('Latitude', fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.gca().set_aspect('equal', adjustable='box')

    out_dir = Path(artifacts_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / image_name
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    return out_path
