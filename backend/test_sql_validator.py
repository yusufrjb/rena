
from sql_validator import validate_sql

test_cases = [
    ("SELECT SUM(gross_sales) FROM olist.v_order_sales", True),
    ("SELECT * FROM olist.v_category_sales LIMIT 10", True),
    ("SELECT * FROM olist.v_payment_analysis", True),

    # DML / DDL
    ("DELETE FROM olist.orders", False),
    ("DROP TABLE olist.customers", False),
    ("UPDATE olist.orders SET order_status = 'delivered'", False),
    ("INSERT INTO olist.orders VALUES ('123')", False),

    # Unauthorized tables
    ("SELECT * FROM olist.customers", False),
    ("SELECT * FROM public.users", False),

    # Multiple statements
    ("SELECT * FROM olist.v_order_sales; DROP TABLE olist.orders", False),

    # CTE and subquery
    (
        "WITH x AS (SELECT * FROM olist.v_order_sales) SELECT * FROM x",
        False,
    ),
    (
        "SELECT * FROM (SELECT * FROM olist.customers) AS x",
        False,
    ),

    # SELECT INTO
    ("SELECT * INTO new_table FROM olist.v_order_sales", False),
    
    ("SELECT * FROM v_category_sales",False
    ),
        # Dangerous PostgreSQL functions
    ("SELECT pg_sleep(10) FROM olist.v_category_sales", False),
    ("SELECT pg_read_file('/etc/passwd') FROM olist.v_category_sales", False),
]

passed = 0

for query, expected in test_cases:
    valid, message = validate_sql(query)
    success = valid == expected

    if success:
        passed += 1

    print(
        f"{'PASS' if success else 'FAIL'} | "
        f"Expected: {expected} | Actual: {valid} | {message}"
    )

print(f"\nResult: {passed}/{len(test_cases)} tests passed.")
