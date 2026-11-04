
# Olist Dataset - Data Quality Findings

## Dataset Overview

- Source: Brazilian E-Commerce Public Dataset by Olist
- Dataset version: 2
- Total CSV files: 9
- Total rows: 1,550,922
- Date range: 2016-09-04 to 2018-10-17

## Primary Key Findings

| Table | Candidate Primary Key |
|---|---|
| customers | customer_id |
| orders | order_id |
| products | product_id |
| sellers | seller_id |
| order_items | order_id, order_item_id |
| order_payments | order_id, payment_sequential |
| order_reviews | review_id, order_id |

## Data Quality Issues

1. Geolocation contains 261,831 duplicate rows.
2. Orders contains 4,908 missing values in delivery and approval timestamps.
3. Reviews contains missing review comments.
4. Products contains missing category and physical attributes.
5. review_id is not unique by itself.
6. All six tested foreign key relationships have zero unmatched records.

## Business Data Observations

- Delivered orders: 96,478.
- Most common payment method: credit_card.
- Most common review score: 5.
- Dataset period: September 2016 - October 2018.

## ETL Considerations

- Preserve valid business records.
- Do not replace missing timestamps arbitrarily.
- Do not delete reviews solely because review_id repeats.
- Use composite keys for transaction tables.
- Deduplicate geolocation using a documented strategy.
