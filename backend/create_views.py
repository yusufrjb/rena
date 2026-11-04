
from sqlalchemy import text
from db import engine


views = {
    "v_order_status_summary": """
        CREATE OR REPLACE VIEW olist.v_order_status_summary AS
        SELECT
            order_status,
            COUNT(*) AS total_orders
        FROM olist.orders
        GROUP BY order_status;
    """,

    "v_order_sales": """
        CREATE OR REPLACE VIEW olist.v_order_sales AS
        SELECT
            o.order_id,
            o.customer_id,
            o.order_status,
            o.order_purchase_timestamp,
            COUNT(oi.order_item_id) AS total_items,
            SUM(oi.price) AS product_sales,
            SUM(oi.freight_value) AS freight_total,
            SUM(oi.price + oi.freight_value) AS gross_sales
        FROM olist.orders o
        JOIN olist.order_items oi
            ON o.order_id = oi.order_id
        GROUP BY
            o.order_id,
            o.customer_id,
            o.order_status,
            o.order_purchase_timestamp;
    """,
    "v_monthly_sales": """
    CREATE OR REPLACE VIEW olist.v_monthly_sales AS
    SELECT
        DATE_TRUNC('month', order_purchase_timestamp)::date AS sales_month,
        COUNT(*) AS total_orders,
        SUM(total_items) AS total_items,
        SUM(product_sales) AS product_sales,
        SUM(freight_total) AS freight_total,
        SUM(gross_sales) AS gross_sales
    FROM olist.v_order_sales
    WHERE order_status = 'delivered'
    GROUP BY DATE_TRUNC('month', order_purchase_timestamp)
    ORDER BY sales_month;
""",

"v_category_sales": """
    CREATE OR REPLACE VIEW olist.v_category_sales AS
    SELECT
        COALESCE(
            pct.product_category_name_english,
            p.product_category_name,
            'unknown'
        ) AS category_name,
        COUNT(DISTINCT oi.order_id) AS total_orders,
        COUNT(*) AS total_items,
        SUM(oi.price) AS product_sales,
        SUM(oi.freight_value) AS freight_total,
        SUM(oi.price + oi.freight_value) AS gross_sales
    FROM olist.order_items oi
    JOIN olist.products p
        ON oi.product_id = p.product_id
    LEFT JOIN olist.product_category_translation pct
        ON p.product_category_name = pct.product_category_name
    JOIN olist.orders o
        ON oi.order_id = o.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY 1;
""",

"v_seller_performance": """
    CREATE OR REPLACE VIEW olist.v_seller_performance AS
    SELECT
        oi.seller_id,
        s.seller_city,
        s.seller_state,
        COUNT(DISTINCT oi.order_id) AS total_orders,
        COUNT(*) AS total_items,
        SUM(oi.price) AS product_sales,
        SUM(oi.freight_value) AS freight_total,
        SUM(oi.price + oi.freight_value) AS gross_sales
    FROM olist.order_items oi
    JOIN olist.sellers s
        ON oi.seller_id = s.seller_id
    JOIN olist.orders o
        ON oi.order_id = o.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY
        oi.seller_id,
        s.seller_city,
        s.seller_state;
""",

"v_payment_analysis": """
    CREATE OR REPLACE VIEW olist.v_payment_analysis AS
    SELECT
        op.payment_type,
        COUNT(*) AS total_transactions,
        COUNT(DISTINCT op.order_id) AS total_orders,
        SUM(op.payment_value) AS total_payment,
        AVG(op.payment_value) AS average_payment
    FROM olist.order_payments op
    JOIN olist.orders o
        ON op.order_id = o.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY op.payment_type;
""",

"v_review_analysis": """
    CREATE OR REPLACE VIEW olist.v_review_analysis AS
    SELECT
        r.review_score,
        COUNT(*) AS total_reviews,
        COUNT(DISTINCT r.order_id) AS total_orders,
        ROUND(AVG(r.review_score)::numeric, 2) AS average_score
    FROM olist.order_reviews r
    JOIN olist.orders o
        ON r.order_id = o.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY r.review_score;
""",

"v_payment_transaction": """
    CREATE OR REPLACE VIEW olist.v_payment_transaction AS
    SELECT
        op.order_id,
        op.payment_sequential,
        op.payment_type,
        op.payment_value
    FROM olist.order_payments op
    JOIN olist.orders o
        ON op.order_id = o.order_id
    WHERE o.order_status = 'delivered';
"""




}

with engine.begin() as connection:
    for view_name, query in views.items():
        connection.execute(text(query))
        print(f"Berhasil membuat view: {view_name}")

print("Pembuatan business views selesai.")
