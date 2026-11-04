from sql_executor import execute_sql


DASHBOARD_QUERIES = {
    "kpis": """
        SELECT
            (SELECT COALESCE(SUM(total_orders), 0)
             FROM olist.v_order_status_summary) AS total_orders,
            (SELECT COUNT(DISTINCT customer_id)
             FROM olist.v_order_sales) AS total_customers,
            (SELECT COALESCE(SUM(gross_sales), 0)
             FROM olist.v_order_sales
             WHERE order_status = 'delivered') AS gross_sales,
            (SELECT COALESCE(SUM(product_sales), 0)
             FROM olist.v_order_sales
             WHERE order_status = 'delivered') AS product_sales,
            (SELECT
                COALESCE(SUM(gross_sales) / NULLIF(COUNT(*), 0), 0)
             FROM olist.v_order_sales
             WHERE order_status = 'delivered') AS average_order_value;
    """,

    "monthly_sales": """
        SELECT sales_month, gross_sales, product_sales
        FROM olist.v_monthly_sales
        ORDER BY sales_month;
    """,

    "order_status": """
        SELECT order_status, total_orders
        FROM olist.v_order_status_summary
        ORDER BY total_orders DESC;
    """,

    "categories": """
        SELECT category_name, gross_sales, product_sales, total_orders
        FROM olist.v_category_sales
        ORDER BY gross_sales DESC
        LIMIT 10;
    """,

    "sellers": """
        SELECT seller_id, seller_city, seller_state, gross_sales
        FROM olist.v_seller_performance
        ORDER BY gross_sales DESC
        LIMIT 10;
    """,

    "payments": """
        SELECT payment_type, total_transactions, total_orders, total_payment
        FROM olist.v_payment_analysis
        ORDER BY total_transactions DESC;
    """,

    "monthly_orders": """
        SELECT sales_month, total_orders
        FROM olist.v_monthly_sales
        ORDER BY sales_month;
    """,

    "reviews": """
        SELECT review_score, total_reviews
        FROM olist.v_review_analysis
        ORDER BY review_score;
    """,

    "freight_vs_product": """
        SELECT sales_month, product_sales, freight_total
        FROM olist.v_monthly_sales
        ORDER BY sales_month;
    """,
}


def get_dashboard_overview() -> dict:
    dashboard_data = {}

    for key, query in DASHBOARD_QUERIES.items():
        result = execute_sql(query)

        if not result.get("success"):
            return {
                "success": False,
                "error": f"Gagal mengambil data dashboard: {key}",
                "data": {},
            }

        rows = result.get("data", [])

        dashboard_data[key] = rows[0] if key == "kpis" and rows else (
            rows if key != "kpis" else {}
        )

    return {
        "success": True,
        "data": dashboard_data,
    }
