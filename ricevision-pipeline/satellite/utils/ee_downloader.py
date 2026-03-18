import requests
import os


def download_ee_csv(url, output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    print("Downloading CSV...")

    response = requests.get(url)

    with open(output_path, "wb") as f:
        f.write(response.content)

    print("Saved:", output_path)

    return output_path
