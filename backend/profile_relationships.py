
from pathlib import Path
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"

def load(name):
    return pd.read_csv(DATA_DIR / name)

customers = load("olist_customers_dataset.csv")
orders = load("olist_orders_dataset.csv")
items = load("olist_order_items_dataset.csv")
payments = load("olist_order_payments_dataset.csv")
reviews = load("olist_order_reviews_dataset.csv")
products = load("olist_products_dataset.csv")
sellers = load("olist_sellers_dataset.csv")

print("=" * 65)
print("PRIMARY KEY CHECK")
print("=" * 65)

checks = {
    "customers.customer_id": customers["customer_id"],
    "orders.order_id": orders["order_id"],
    "products.product_id": products["product_id"],
    "sellers.seller_id": sellers["seller_id"],
    "reviews.review_id": reviews["review_id"],
}

for name, column in checks.items():
    print(
        f"{name}: unique={column.is_unique}, "
        f"null={column.isna().sum()}"
    )

print("\n" + "=" * 65)
print("FOREIGN KEY CHECK")
print("=" * 65)

relationships = [
    ("orders.customer_id", orders["customer_id"], customers["customer_id"]),
    ("items.order_id", items["order_id"], orders["order_id"]),
    ("items.product_id", items["product_id"], products["product_id"]),
    ("items.seller_id", items["seller_id"], sellers["seller_id"]),
    ("payments.order_id", payments["order_id"], orders["order_id"]),
    ("reviews.order_id", reviews["order_id"], orders["order_id"]),
]

for name, child, parent in relationships:
    unmatched = (~child.isin(parent)).sum()
    print(f"{name}: unmatched={unmatched:,}")

print("\n" + "=" * 65)
print("ORDER STATUS DISTRIBUTION")
print("=" * 65)
print(orders["order_status"].value_counts(dropna=False).to_string())

print("\n" + "=" * 65)
print("ORDER DATE RANGE")
print("=" * 65)

dates = pd.to_datetime(
    orders["order_purchase_timestamp"],
    errors="coerce"
)

print("Earliest:", dates.min())
print("Latest  :", dates.max())

print("\n" + "=" * 65)
print("PAYMENT TYPE DISTRIBUTION")
print("=" * 65)
print(payments["payment_type"].value_counts().to_string())

print("\n" + "=" * 65)
print("REVIEW SCORE DISTRIBUTION")
print("=" * 65)
print(reviews["review_score"].value_counts().sort_index().to_string())
