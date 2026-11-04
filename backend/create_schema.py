from sqlalchemy import text
from db import engine

schema_sql = """
CREATE SCHEMA IF NOT EXISTS olist;

CREATE TABLE IF NOT EXISTS olist.customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_unique_id VARCHAR(50),
    customer_zip_code_prefix VARCHAR(10),
    customer_city VARCHAR(100),
    customer_state VARCHAR(5)
);

CREATE TABLE IF NOT EXISTS olist.geolocation (
    geolocation_zip_code_prefix VARCHAR(10),
    geolocation_lat DOUBLE PRECISION,
    geolocation_lng DOUBLE PRECISION,
    geolocation_city VARCHAR(100),
    geolocation_state VARCHAR(5)
);

CREATE TABLE IF NOT EXISTS olist.orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50),
    order_status VARCHAR(30),
    order_purchase_timestamp TIMESTAMP,
    order_approved_at TIMESTAMP,
    order_delivered_carrier_date TIMESTAMP,
    order_delivered_customer_date TIMESTAMP,
    order_estimated_delivery_date TIMESTAMP,
    CONSTRAINT fk_orders_customers
        FOREIGN KEY (customer_id)
        REFERENCES olist.customers(customer_id)
);

CREATE TABLE IF NOT EXISTS olist.products (
    product_id VARCHAR(50) PRIMARY KEY,
    product_category_name VARCHAR(100),
    product_name_lenght INTEGER,
    product_description_lenght INTEGER,
    product_photos_qty INTEGER,
    product_weight_g INTEGER,
    product_length_cm INTEGER,
    product_height_cm INTEGER,
    product_width_cm INTEGER
);

CREATE TABLE IF NOT EXISTS olist.sellers (
    seller_id VARCHAR(50) PRIMARY KEY,
    seller_zip_code_prefix VARCHAR(10),
    seller_city VARCHAR(100),
    seller_state VARCHAR(5)
);

CREATE TABLE IF NOT EXISTS olist.order_items (
    order_id VARCHAR(50),
    order_item_id INTEGER,
    product_id VARCHAR(50),
    seller_id VARCHAR(50),
    shipping_limit_date TIMESTAMP,
    price NUMERIC(12,2),
    freight_value NUMERIC(12,2),
    PRIMARY KEY (order_id, order_item_id),
    FOREIGN KEY (order_id) REFERENCES olist.orders(order_id),
    FOREIGN KEY (product_id) REFERENCES olist.products(product_id),
    FOREIGN KEY (seller_id) REFERENCES olist.sellers(seller_id)
);

CREATE TABLE IF NOT EXISTS olist.order_payments (
    order_id VARCHAR(50),
    payment_sequential INTEGER,
    payment_type VARCHAR(30),
    payment_installments INTEGER,
    payment_value NUMERIC(12,2),
    PRIMARY KEY (order_id, payment_sequential),
    FOREIGN KEY (order_id) REFERENCES olist.orders(order_id)
);

CREATE TABLE IF NOT EXISTS olist.order_reviews (
    review_id VARCHAR(50),
    order_id VARCHAR(50),
    review_score INTEGER,
    review_comment_title TEXT,
    review_comment_message TEXT,
    review_creation_date TIMESTAMP,
    review_answer_timestamp TIMESTAMP,
    PRIMARY KEY (review_id, order_id),
    FOREIGN KEY (order_id) REFERENCES olist.orders(order_id)
);

CREATE TABLE IF NOT EXISTS olist.product_category_translation (
    product_category_name VARCHAR(100) PRIMARY KEY,
    product_category_name_english VARCHAR(100)
);
"""

with engine.begin() as connection:
    connection.execute(text(schema_sql))

print("Schema dan 9 tabel Olist berhasil dibuat.")