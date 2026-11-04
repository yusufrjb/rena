
from pathlib import Path
import pandas as pd

# Lokasi dataset
DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"

# Seluruh file CSV
csv_files = sorted(DATA_DIR.glob("*.csv"))

if not csv_files:
    raise FileNotFoundError(f"Tidak ada file CSV di {DATA_DIR}")

print("=" * 70)
print("OLIST DATASET EXPLORATION")
print("=" * 70)

for file in csv_files:
    print(f"\n{'=' * 70}")
    print(f"FILE: {file.name}")
    print("=" * 70)

    df = pd.read_csv(file)

    print(f"Jumlah baris     : {len(df):,}")
    print(f"Jumlah kolom     : {len(df.columns)}")
    print(f"Duplikasi baris  : {df.duplicated().sum():,}")
    print(f"Total missing    : {df.isna().sum().sum():,}")

    print("\nTipe data:")
    print(df.dtypes.to_string())

    print("\nMissing values per kolom:")
    missing = df.isna().sum()
    print(missing[missing > 0].to_string() if missing.any() else "Tidak ada")

    print("\nContoh data:")
    print(df.head(3).to_string(index=False))

print("\n" + "=" * 70)
print("EXPLORATION COMPLETED")
print("=" * 70)
