
SCHEMA_CONTEXT = """
Database: PostgreSQL
Schema: olist

BUSINESS VIEWS:

1. olist.v_order_sales
- order_id
- customer_id
- order_status
- order_purchase_timestamp
- total_items
- product_sales
- freight_total
- gross_sales

2. olist.v_monthly_sales
- sales_month
- total_orders
- total_items
- product_sales
- freight_total
- gross_sales

3. olist.v_category_sales
- category_name
- total_orders
- total_items
- product_sales
- freight_total
- gross_sales

4. olist.v_seller_performance
- seller_id
- seller_city
- seller_state
- total_orders
- total_items
- product_sales
- freight_total
- gross_sales

5. olist.v_payment_analysis
- payment_type
- total_transactions
- total_orders
- total_payment
- average_payment

6. olist.v_review_analysis
- review_score
- total_reviews
- total_orders
- average_score

7. olist.v_payment_transaction:
- Each row represents one individual payment transaction.
- Includes only orders with delivered status.
- Columns: order_id, payment_sequential, payment_type, payment_value.
- Use AVG(payment_value) to calculate the average payment value per transaction.
- Use SUM(payment_value) to calculate the total payment value.
- Do not use the order_status column because it is not available in this view.

8.olist.v_order_status_summary:
- Each row represents one order status.
- Includes all orders from the orders table, including orders without items.
- Columns: order_status, total_orders.
- Use SUM(total_orders) to calculate the total number of all orders.
- Use the delivered row's total_orders to calculate delivered order count.
- Use this view as the denominator when calculating the percentage of delivered orders among all orders.

BUSINESS RULES:

- Revenue uses product_sales or gross_sales.
- product_sales = SUM(price).
- gross_sales = SUM(price + freight_value).
- Monthly and category sales views include delivered orders only.
- Seller performance includes delivered orders only.
- Payment and review analysis include delivered orders only.
- One order can contain multiple items.
- One order can have multiple payment records.
- One order can have multiple review records.
- Do not sum payment values together with order item values.
- Use read-only SELECT queries only.

"""
