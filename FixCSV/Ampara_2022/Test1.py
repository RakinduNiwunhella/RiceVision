import pandas as pd
import glob

# get all Ampara 2022 csv files
files = sorted(glob.glob("Ampara_2022_m*.csv"))

# read and combine
df = pd.concat([pd.read_csv(f) for f in files], ignore_index=True)

# save final combined file
df.to_csv("Ampara_2022.csv", index=False)

print("Combined CSV saved as Ampara_2022.csv")