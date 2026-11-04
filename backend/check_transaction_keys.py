
from pathlib import Path
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"

items = pd.read_csv(DATA_DIR / "olist_order_items_dataset.csv")
payments = pd.read_csv(DATA_DIR / "olist_order_payments_dataset.csv")

print("=" * 60)
print("ORDER ITEMS PRIMARY KEY CHECK")
print("=" * 60)

print("Total rows:", len(items))
print("Unique order_id:", items["order_id"].nunique())
print("Duplicate order_id:", items["order_id"].duplicated().sum())
print(
    "Duplicate (order_id, order_item_id):",
    items.duplicated(["order_id", "order_item_id"]).sum()
)
print("Null order_item_id:", items["order_item_id"].isna().sum())

print("\n" + "=" * 60)
print("ORDER PAYMENTS PRIMARY KEY CHECK")
print("=" * 60)

print("Total rows:", len(payments))
print("Unique order_id:", payments["order_id"].nunique())
print("Duplicate order_id:", payments["order_id"].duplicated().sum())
print(
    "Duplicate (order_id, payment_sequential):",
    payments.duplicated(["order_id", "payment_sequential"]).sum()
)
print("Null payment_sequential:", payments["payment_sequential"].isna().sum())

print("\n" + "=" * 60)
print("COMPOSITE KEY VALIDATION COMPLETED")
print("=" * 60)
