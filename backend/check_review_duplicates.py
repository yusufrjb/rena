
from pathlib import Path
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"

reviews = pd.read_csv(DATA_DIR / "olist_order_reviews_dataset.csv")

print("=" * 60)
print("REVIEW DUPLICATE INVESTIGATION")
print("=" * 60)

# Jumlah review_id berulang
duplicate_mask = reviews.duplicated("review_id", keep=False)
duplicate_rows = reviews[duplicate_mask]

print("Total rows:", len(reviews))
print("Unique review_id:", reviews["review_id"].nunique())
print("Rows with duplicated review_id:", len(duplicate_rows))
print("Duplicated review_id groups:", 
      duplicate_rows["review_id"].nunique())

print("\nContoh review_id yang berulang:")
print(
    duplicate_rows.sort_values("review_id")
    .head(10)
    .to_string(index=False)
)

# Periksa apakah order_id juga berulang
print("\nDuplicate order_id:", reviews["order_id"].duplicated().sum())

# Periksa apakah ada baris yang identik sepenuhnya
print("Exact duplicate rows:", reviews.duplicated().sum())

# Periksa kombinasi review_id dan order_id
print(
    "Duplicate review_id + order_id:",
    reviews.duplicated(["review_id", "order_id"]).sum()
)
