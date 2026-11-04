
from sql_executor import execute_sql

test_cases = [
    {
        "name": "Total gross sales",
        "query": """
            SELECT ROUND(SUM(gross_sales)::numeric, 2) AS total_gross_sales
            FROM olist.v_order_sales
        """,
    },
    {
        "name": "Top 5 product categories",
        "query": """
            SELECT category_name, product_sales
            FROM olist.v_category_sales
            ORDER BY product_sales DESC
            LIMIT 5
        """,
    },
    {
        "name": "Forbidden table access",
        "query": """
            SELECT * FROM olist.customers
        """,
    },
]

for test in test_cases:
    print(f"\nTEST: {test['name']}")

    result = execute_sql(test["query"])

    if result["success"]:
        print("PASS | Query berhasil dieksekusi")
        print("Columns:", result["columns"])

        for row in result["data"]:
            print(row)
    else:
        print("BLOCKED |", result["error"])

tests = [
    ("Tanpa LIMIT", "SELECT * FROM olist.v_category_sales"),
    ("LIMIT 500", "SELECT * FROM olist.v_category_sales LIMIT 500"),
    ("LIMIT 5", "SELECT * FROM olist.v_category_sales LIMIT 5"),
]

for name, query in tests:
    result = execute_sql(query)

    print(f"\nTEST: {name}")

    if result["success"]:
        print(f"PASS | Jumlah baris: {len(result['data'])}")
    else:
        print(f"FAIL | {result['error']}")