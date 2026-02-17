import pandas as pd
import numpy as np

np.random.seed(42)

districts = [
"Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha",
"Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala",
"Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya",
"Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya"
]

seasons = ["Yala","Maha"]
years = [2021,2022,2023,2024,2025]

rows = []

for district in districts:
    for year in years:
        for season in seasons:

            # district productivity factor (important realism)
            high_yield = ["Ampara","Polonnaruwa","Anuradhapura","Kurunegala"]
            medium_yield = ["Batticaloa","Trincomalee","Hambantota","Puttalam"]
            
            district_factor = 0
            if district in high_yield:
                district_factor = 0.5
            elif district in medium_yield:
                district_factor = 0.2
            else:
                district_factor = -0.1

            # season behaviour
            if season == "Yala":
                rain = np.random.normal(200,35)
                stress_days = np.random.randint(2,9)
                temp = np.random.normal(32,1.3)
                avg_health = np.random.normal(0.72,0.05)
            else:  # Maha
                rain = np.random.normal(330,55)
                stress_days = np.random.randint(0,4)
                temp = np.random.normal(29.5,1.1)
                avg_health = np.random.normal(0.82,0.04)

            veg_days = np.random.randint(25,35)
            repro_days = np.random.randint(35,45)

            stress_flowering = max(0, int(stress_days - np.random.randint(0,3)))
            peak_health = min(1, avg_health + np.random.normal(0.08,0.03))
            auc_health = avg_health * np.random.uniform(55,75)

            # yield formula
            yield_val = (
                2.5
                + 3.5 * avg_health
                + 0.004 * rain
                - 0.12 * stress_days
                - 0.05 * max(0,temp-31)
                + 0.8 * peak_health
                + district_factor
                + np.random.normal(0,0.25)
            )

            yield_val = round(max(2.0, min(7.5, yield_val)),2)

            rows.append([
                district,season,year,veg_days,repro_days,
                round(avg_health,2),stress_days,stress_flowering,
                round(rain,1),round(temp,1),round(peak_health,2),
                round(auc_health,1),yield_val
            ])

columns = [
    "district","season","year","veg_days","repro_days","avg_health",
    "stress_days","stress_flowering","rain_flowering","temp_flowering",
    "peak_health","auc_health","yield"
]

df = pd.DataFrame(rows,columns=columns)

df.to_csv("rice_sri_lanka_full_dataset.csv",index=False)

print("Total rows:", len(df))
df.head()