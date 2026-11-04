from sqlalchemy import text
from db import engine

checks = {
    "orders tanpa customer": """
        SELECT COUNT(*)
        FROM olist.orders o
        LEFT JOIN olist.customers c
            ON o.customer_id = c.customer_id
        WHERE c.customer_id IS NULL
    """,
    "order_items tanpa orders": """
        SELECT COUNT(*)
        FROM olist.order_items oi
        LEFT JOIN olist.orders o
            ON oi.order_id = o.order_id
        WHERE o.order_id IS NULL
    """,
    "order_items tanpa products": """
        SELECT COUNT(*)
        FROM olist.order_items oi
        LEFT JOIN olist.products p
            ON oi.product_id = p.product_id
        WHERE p.product_id IS NULL
    """,
    "order_items tanpa sellers": """
        SELECT COUNT(*)
        FROM olist.order_items oi
        LEFT JOIN olist.sellers s
            ON oi.seller_id = s.seller_id
        WHERE s.seller_id IS NULL
    """,
    "order_payments tanpa orders": """
        SELECT COUNT(*)
        FROM olist.order_payments op
        LEFT JOIN olist.orders o
            ON op.order_id = o.order_id
        WHERE o.order_id IS NULL
    """,
    "order_reviews tanpa orders": """
        SELECT COUNT(*)
        FROM olist.order_reviews r
        LEFT JOIN olist.orders o
            ON r.order_id = o.order_id
        WHERE o.order_id IS NULL
    """,
}

with engine.connect() as connection:
    print("=" * 55)
    print("DATABASE RELATIONSHIP VALIDATION")
    print("=" * 55)

    for label, query in checks.items():
        result = connection.execute(text(query)).scalar()
        status = "PASS" if result == 0 else "FAIL"
        print(f"{status:<6} | {label}: {result}")

    print("=" * 55)