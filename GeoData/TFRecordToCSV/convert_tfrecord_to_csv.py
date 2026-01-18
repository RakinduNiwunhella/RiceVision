import tensorflow as tf
import pandas as pd
import os

# =====================================================
# CONFIG
# =====================================================
TFRECORD_PATH = "JAN2024_TILE_0-00000.tfrecord.gz"
OUTPUT_CSV = "JAN2024_TILE_0.csv"
CHUNK_SIZE = 100_000
# =====================================================

# =====================================================
# TFRECORD SCHEMA (MATCHES YOUR FILE EXACTLY)
# =====================================================
feature_description = {
    'B1': tf.io.FixedLenFeature([], tf.float32),
    'B2': tf.io.FixedLenFeature([], tf.float32),
    'B3': tf.io.FixedLenFeature([], tf.float32),
    'B4': tf.io.FixedLenFeature([], tf.float32),
    'B5': tf.io.FixedLenFeature([], tf.float32),
    'B6': tf.io.FixedLenFeature([], tf.float32),
    'B7': tf.io.FixedLenFeature([], tf.float32),
    'B8': tf.io.FixedLenFeature([], tf.float32),
    'B8A': tf.io.FixedLenFeature([], tf.float32),
    'B9': tf.io.FixedLenFeature([], tf.float32),
    'B11': tf.io.FixedLenFeature([], tf.float32),
    'B12': tf.io.FixedLenFeature([], tf.float32),

    # 🔑 STRING FIELDS
    'SCL': tf.io.FixedLenFeature([], tf.string),
    'Satellite': tf.io.FixedLenFeature([], tf.string),

    # GEOMETRY
    'longitude': tf.io.FixedLenFeature([], tf.float32),
    'latitude': tf.io.FixedLenFeature([], tf.float32),

    # METADATA
    'Date': tf.io.FixedLenFeature([], tf.int64),
    'CloudyPixelPercent': tf.io.FixedLenFeature([], tf.float32),
    'image_id': tf.io.FixedLenFeature([], tf.float32),
}

def parse_example(example_proto):
    return tf.io.parse_single_example(example_proto, feature_description)

# =====================================================
# LOAD TFRECORD (GZIP)
# =====================================================
dataset = tf.data.TFRecordDataset(
    TFRECORD_PATH,
    compression_type="GZIP"
).map(parse_example)

# Remove old CSV if exists
if os.path.exists(OUTPUT_CSV):
    os.remove(OUTPUT_CSV)

buffer = []
row_count = 0

print("Starting conversion...")

# =====================================================
# CONVERT TFRECORD → CSV (CHUNKED)
# =====================================================
for record in dataset:
    row = {}

    for k, v in record.items():
        val = v.numpy()

        if k in ("Satellite", "SCL"):
            val = val.decode("utf-8")  # bytes → string

        row[k] = val

    buffer.append(row)

    if len(buffer) >= CHUNK_SIZE:
        df = pd.DataFrame(buffer)

        # Convert millis → datetime
        df["Date"] = pd.to_datetime(df["Date"], unit="ms")

        df.to_csv(
            OUTPUT_CSV,
            mode="a",
            index=False,
            header=not os.path.exists(OUTPUT_CSV)
        )

        row_count += len(buffer)
        print(f"Wrote {row_count:,} rows")
        buffer = []

# Write remaining rows
if buffer:
    df = pd.DataFrame(buffer)
    df["Date"] = pd.to_datetime(df["Date"], unit="ms")

    df.to_csv(
        OUTPUT_CSV,
        mode="a",
        index=False,
        header=not os.path.exists(OUTPUT_CSV)
    )

    row_count += len(buffer)

print("DONE ✅ Total rows:", row_count)