import pandas as pd

# Load your CSV
file_path = "merged_combined_satellite.csv"  # Change path if needed
df = pd.read_csv(file_path)

# Ensure district column exists
if "district" not in df.columns:
    raise ValueError("Column 'district' not found in CSV file.")

# Count actual NaN values before cleaning
nan_count_actual = df["district"].isna().sum()

# Clean district values (strip spaces)
df["district"] = df["district"].astype(str).str.strip()

# Count string "nan" values after conversion
nan_count_string = (df["district"].str.lower() == "nan").sum()

# Official 25 Sri Lankan districts
all_districts = [
    "Colombo", "Gampaha", "Kalutara",
    "Kandy", "Matale", "Nuwara Eliya",
    "Galle", "Matara", "Hambantota",
    "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu",
    "Batticaloa", "Ampara", "Trincomalee",
    "Kurunegala", "Puttalam",
    "Anuradhapura", "Polonnaruwa",
    "Badulla", "Monaragala",
    "Ratnapura", "Kegalle"
]

# Get unique districts from CSV
csv_districts = sorted(df["district"].dropna().unique())

# Find missing districts
missing = sorted(set(all_districts) - set(csv_districts))

# Find extra districts (if any)
extra = sorted(set(csv_districts) - set(all_districts))

print("\n=== DISTRICT CHECK REPORT ===")
print("Total districts in CSV:", len(csv_districts))
print("Official district count:", len(all_districts))
print("Rows with actual NaN district values:", nan_count_actual)
print('Rows labeled as string "nan":', nan_count_string)

print("\nMissing Districts:")
if missing:
    for d in missing:
        print("-", d)
else:
    print("None")

print("\nExtra / Invalid Districts in CSV:")
if extra:
    for d in extra:
        print("-", d)
else:
    print("None")