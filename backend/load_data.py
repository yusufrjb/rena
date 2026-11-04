from pathlib import Path
import pandas as pd
from sqlalchemy import text
from db import engine

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "raw"

TABLES = {
    "olist_customers_dataset.csv": "customers",
    "olist_geolocation_dataset.csv": "geolocation",
    "olist_products_dataset.csv": "products",
    "olist_sellers_dataset.csv": "sellers",
    "olist_orders_dataset.csv": "orders",
    "olist_order_items_dataset.csv": "order_items",
    "olist_order_payments_dataset.csv": "order_payments",
    "olist_order_reviews_dataset.csv": "order_reviews",
    "product_category_name_translation.csv": "product_category_translation",
}

DATE_COLUMNS = {
    "orders": [
        "order_purchase_timestamp",
        "order_approved_at",
        "order_delivered_carrier_date",
        "order_delivered_customer_date",
        "order_estimated_delivery_date",
    ],
    "order_items": [
        "shipping_limit_date",
    ],
    "order_reviews": [
        "review_creation_date",
        "review_answer_timestamp",
    ],
}
for filename, table_name in TABLES.items():
    print(f"\nMemeriksa olist.{table_name}...")

    with engine.connect() as connection:
        count = connection.execute(
            text(f"SELECT COUNT(*) FROM olist.{table_name}")
        ).scalar_one()

    if count > 0:
        print(f"Dilewati: sudah ada {count:,} baris.")
        continue

    file_path = DATA_DIR / filename
    df = pd.read_csv(file_path)

    if table_name in DATE_COLUMNS:
        for column in DATE_COLUMNS[table_name]:
            df[column] = pd.to_datetime(df[column], errors="coerce")

    df.to_sql(
        name=table_name,
        con=engine,
        schema="olist",
        if_exists="append",
        index=False,
        chunksize=1000,
        method=None,
    )

    print(f"Berhasil: {len(df):,} baris.")

print("\nETL selesai.")