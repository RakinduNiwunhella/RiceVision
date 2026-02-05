import pandas as pd

# input file
input_file = "Ampara_points_with_ds.csv"

# output file
output_file = "sorted_Ampara_sl_paddy.csv"

# read csv
df = pd.read_csv(input_file)

# convert column to datetime
df["ten_day"] = pd.to_datetime(df["ten_day"], errors="coerce")

# sort by date
df = df.sort_values(by="ten_day")

# save
df.to_csv(output_file, index=False)

print("Sorted file saved as:", output_file)