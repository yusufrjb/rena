
from text_to_sql import generate_sql
from sql_executor import execute_sql
from llm_client import generate_response
from decimal import Decimal
from rag.rag_chain import ask_rag
from mcp_server.client import query_business_data
from mcp_server.client import get_mcp_tool_descriptions
from mcp_server.client import list_available_views


CATEGORY_LABELS = {
    "health_beauty": "Health & Beauty",
    "watches_gifts": "Watches & Gifts",
    "bed_bath_table": "Bed, Bath & Table",
    "sports_leisure": "Sports & Leisure",
    "computers_accessories": "Computers & Accessories",
}

def format_category_label(category_name: str) -> str:
    if not category_name or category_name == "unknown":
        return "Unknown"

    return CATEGORY_LABELS.get(
        category_name,
        category_name.replace("_", " ").title()
    )



def generate_business_insight(question: str, data: list) -> str:
    import json

    prompt = f"""
You are a professional business intelligence analyst.

Analyze the SQL query result and provide a concise business interpretation.

USER QUESTION:
{question}

QUERY RESULT (JSON):
{json.dumps(data, ensure_ascii=False, default=str)}

DATA CONTEXT:
- Dataset: Brazilian E-Commerce (Olist).
- gross_sales = product sales + freight value.
- gross_sales is not profit, net sales, or net income.
- product_sales = product value excluding freight.
- freight_total = total freight value.

STRICT RULES:
1. Write entirely in Indonesian.
2. Maximum 2 concise sentences.
3. Return only the insight paragraph without a heading.
4. Only explain facts directly established by QUERY RESULT.
5. Never invent trends, causes, recommendations, or values.
6. Preserve the exact metric requested by the user.
7. gross_sales must be called "gross sales" or "penjualan bruto".
8. product_sales must be called "product sales" or "penjualan produk".
9. Never confuse gross sales, product sales, and freight.
10. For monetary values, copy the exact numeric value from QUERY RESULT.
11. Never calculate, round, estimate, or modify monetary values.
12. Use R$ only for actual monetary columns.
13. Never format year, month, ID, count, or quantity as currency.
14. Never format years as decimal numbers.
15. For seller rankings, identify the seller by city and state when available.
16. Do not include seller_id in the insight.
17. For category rankings, use the exact category display name.
18. Do not list all rows because they are already displayed in the report.
19. For time-series data, identify the highest and lowest values only by comparing rows with the SAME metric.
20. Determine the time period from the actual date or year/month columns.
21. Never compare values from different years or months as if they belong to the same period.
22. Never assume a previous month's value belongs to another year.
23. If the result contains separate columns for different years, preserve each column's year exactly.
24. If the requested metric or a valid comparison is unclear, provide a neutral description without inventing a comparison.
25. Do not identify the largest increase or decrease unless the change is explicitly calculated in the result.
26. When multiple metrics exist, prioritize the metric explicitly requested in USER QUESTION.
27. Use natural, concise Indonesian business language.

Before writing, internally verify:
- Which column represents the requested metric?
- Which row or period contains the highest value?
- Which row or period contains the lowest value?
- Are the compared values from the correct periods?
- Does every monetary value exactly match QUERY RESULT?

Return only the final insight.
"""
    return generate_response(prompt).strip()



from decimal import Decimal

def calculate_time_series_insight(data: list, metric: str) -> str | None:
    if not data:
        return None

    valid_rows = [
        row for row in data
        if row.get("sales_month") is not None
        and isinstance(row.get(metric), (int, float, Decimal))
    ]

    if not valid_rows:
        return None

    highest = max(valid_rows, key=lambda row: row[metric])
    lowest = min(valid_rows, key=lambda row: row[metric])

    month_names = {
        "01": "Januari", "02": "Februari",
        "03": "Maret", "04": "April",
        "05": "Mei", "06": "Juni",
        "07": "Juli", "08": "Agustus",
        "09": "September", "10": "Oktober",
        "11": "November", "12": "Desember",
    }

    def format_month(date_value):
        date_str = str(date_value)
        year, month = date_str[:7].split("-")
        return f"{month_names[month]} {year}"

    def format_currency(value):
        formatted = f"{value:,.2f}"
        formatted = formatted.replace(",", "X")
        formatted = formatted.replace(".", ",")
        formatted = formatted.replace("X", ".")
        return f"R$ {formatted}"

    return (
        f"Gross sales tertinggi tercatat pada "
        f"{format_month(highest['sales_month'])} sebesar "
        f"{format_currency(highest[metric])}, sedangkan "
        f"nilai terendah tercatat pada "
        f"{format_month(lowest['sales_month'])} sebesar "
        f"{format_currency(lowest[metric])}."
    )

def format_query_report(question: str, data: list) -> str:
    if not data:
        return "Tidak ada data yang ditemukan."

    lines = ["**Hasil Analisis**", ""]

    month_names = {
        "01": "Januari", "02": "Februari",
        "03": "Maret", "04": "April",
        "05": "Mei", "06": "Juni",
        "07": "Juli", "08": "Agustus",
        "09": "September", "10": "Oktober",
        "11": "November", "12": "Desember",
    }

    currency_fields = {
        "gross_sales",
        "product_sales",
        "freight_total",
        "payment_value",
        "avg_payment_value",
        "total_gross_sales",
        "total_product_sales",
        "total_payment",
        "total_payment_value",
        "avg_gross_sales",
        "average_gross_sales",
        "average_product_sales",
        "avg_product_sales",
        "avg_product_sales_per_delivered_order",
        "average_product_sales_per_order",
        "average_freight_total",
        "avg_freight_total",
        "total_freight_total",
        "average_payment_value",
        "rata_rata_payment_value",
        "rata_rata_gross_sales",
        }
    percentage_fields = {
    "persentase_pesanan_delivered",
    "persentase_pesanan_dibatalkan",
    "persentase_pesanancancelled",
    "persentase_pesanan_shipped",
    "persentase_pesanan_processing",
    "persentase_pesanan_unavailable",
    "persentase_pesanan_invoiced",
    "persentase_pesanan_disetujui",
    "persentase_pesanan",
    "percentage",
    "persentase",
    }

    field_labels = {
        "total_items": "Item Terjual",
        "product_sales": "Product Sales",
        "freight_total": "Freight Total",
        "gross_sales": "Gross Sales",
        "total_gross_sales": "Total Gross Sales",
        "total_product_sales": "Total Product Sales",
        "total_transactions": "Total Transactions",
        "total_payment_value": "Total Payment Value",
        "review_score": "Review Score",
        "total_reviews": "Total Reviews",
        "total_review_count": "Total Reviews",
        "avg_review_score": "Average Review Score",
        "total_orders": "Total Pesanan",
        "avg_gross_sales": "Rata-rata Gross Sales",
        "average_gross_sales": "Rata-rata Gross Sales",
        "average_product_sales": "Rata-rata Product Sales",
        "avg_product_sales": "Rata-rata Product Sales",
        "average_payment_value": "Rata-rata Payment Value",
        "avg_payment_value": "Rata-rata Payment Value",
        "rata_rata_payment_value": "Rata-rata Payment Value",
        "rata_rata_gross_sales" : "Rata-rata Gross Sales",
    }

    def format_number(value, decimals=2):
        formatted = f"{value:,.{decimals}f}"
        return formatted.replace(",", "X").replace(".", ",").replace("X", ".")

    def format_value(key, value):
        if key in percentage_fields:
            return f"{format_number(value, decimals=4)}%"

        if key in currency_fields or key == "sum":
            return f"R$ {format_number(value)}"

        if key in {
            "total_orders",
            "total_items",
            "total_reviews",
            "total_review_count",
            "total_transactions",
        }:
            return f"{value:,.0f}".replace(",", ".")

        if isinstance(value, int) or (
            isinstance(value, float) and value.is_integer()
        ):
            return f"{value:,.0f}".replace(",", ".")

        return format_number(value)

    for index, row in enumerate(data, start=1):
        category = row.get("category_label") or row.get("category_name")
        sales_month = row.get("sales_month")
        seller_city = row.get("seller_city")
        seller_state = row.get("seller_state")
        payment_type = row.get("payment_type")
        review_score = row.get("review_score")
        order_status = row.get("order_status")

        if sales_month:
            month = str(sales_month)[:7]
            year, month_number = month.split("-")
            label = f"{month_names.get(month_number, month_number)} {year}"
        elif category:
            label = category
        elif payment_type:
            label = payment_type.replace("_", " ").title()
        elif review_score is not None:
            label = f"Rating {review_score}"
        elif order_status:
            label = order_status.replace("_", " ").title()
        elif seller_city:
            label = f"{seller_city.title()}, {seller_state}"
        else:
            label = None

        numeric_fields = []

        for key, value in row.items():
            if isinstance(value, bool) or value is None:
                continue

            if isinstance(value, (int, float, Decimal)):
                numeric_fields.append((key, value))
                continue

            if isinstance(value, str):
                try:
                    numeric_fields.append((key, Decimal(value)))
                except Exception:
                    continue

        if not numeric_fields:
            continue

        if label:
            lines.append(f"**{label}**")

            for key, value in numeric_fields:
                display_label = field_labels.get(
                    key, key.replace("_", " ").title()
                )
                lines.append(
                    f"- {display_label}: {format_value(key, value)}"
                )

        elif len(numeric_fields) == 1:
            key, value = numeric_fields[0]

            if key in {"avg_gross_sales", "average_gross_sales"}:
                lines.append(
                    f"**Rata-rata Gross Sales: {format_value(key, value)}**"
                )

            elif key in {"average_product_sales", "avg_product_sales"}:
                lines.append(
                    f"**Rata-rata Product Sales: {format_value(key, value)}**"
                )

            elif key == "total_orders":
                lines.append(
                    f"**Total Pesanan: {format_value(key, value)}**"
                )

            elif key == "total_items":
                lines.append(
                    f"**Total Item Terjual: {format_value(key, value)}**"
                )
                
            elif key.startswith(("avg_", "average_", "rata_rata_")):
                metric = key

                for prefix in ("average_", "avg_", "rata_rata_"):
                    if metric.startswith(prefix):
                        metric = metric[len(prefix):]
                        break

                metric = metric.replace("_per_delivered_order", "")
                metric = metric.replace("_per_order", "")
                metric = metric.replace("_per_pesanan_delivered", "")
                metric = metric.replace("_per_pesanan", "")
                metric = metric.replace("_", " ").title()

                lines.append(
                    f"**Rata-rata {metric}: {format_value(key, value)}**"
                )
            
            elif key == "total_freight_total":
                lines.append(
                    f"**Total Freight: {format_value(key, value)}**"
                )
            
            elif key in currency_fields or key == "sum":
                lines.append(f"**Total: {format_value(key, value)}**")

            else:
                display_label = field_labels.get(
                    key, key.replace("_", " ").title()
                )
                lines.append(
                    f"**Total {display_label}: {format_value(key, value)}**"
                )
        else:
            lines.append(f"**Data {index}**")

            for key, value in numeric_fields:
                display_label = field_labels.get(
                    key, key.replace("_", " ").title()
                )
                lines.append(
                    f"- {display_label}: {format_value(key, value)}"
                )

        lines.append("")

    return "\n".join(lines).strip()


async def ask_business_question(question: str) -> dict:
    if not question or not question.strip():
        return {
            "success": False,
            "error": "Pertanyaan tidak boleh kosong.",
        }
    
    if is_ambiguous_sales_question(question):
        return {
            "success": False,
            "question": question,
            "generated_sql": None,
            "data": [],
            "columns": [],
            "business_insight": None,
            "error": (
                "Istilah total penjualan masih ambigu. "
                "Silakan tentukan apakah yang dimaksud "
                "product sales atau gross sales."
            ),
            "report": None,
        }
    
    try:
        sql = generate_sql(question)
        question_lower = question.lower()

        is_delivered_percentage_question = (
            "persentase" in question_lower
            and "delivered" in question_lower
            and any(keyword in question_lower for keyword in [
                "seluruh pesanan",
                "semua pesanan",
                "seluruh order",
                "semua order",
            ])
        )

        if is_delivered_percentage_question:
            sql = """
            SELECT
                SUM(
                    CASE
                        WHEN order_status = 'delivered'
                        THEN total_orders
                        ELSE 0
                    END
                )::numeric
                / NULLIF(SUM(total_orders), 0) * 100
                AS persentase_pesanan_delivered
            FROM olist.v_order_status_summary;
            """
        
        is_category_multi_metric_question = (
            "kategori" in question_lower
            and any(keyword in question_lower for keyword in [
                "jumlah pesanan",
                "total pesanan",
            ])
            and any(keyword in question_lower for keyword in [
                "jumlah item",
                "item terjual",
            ])
        )

        if is_category_multi_metric_question:
            sql = """
            SELECT
                category_name,
                total_orders,
                total_items
            FROM olist.v_category_sales
            ORDER BY total_items DESC
            LIMIT 5;
            """

        print("DEBUG CATEGORY OVERRIDE:", is_category_multi_metric_question)
        print("DEBUG GENERATED SQL:", sql)
        is_monthly_top_gross_sales_question = (
            any(keyword in question_lower for keyword in [
                "gross sales",
                "penjualan bruto",
            ])
            and any(keyword in question_lower for keyword in [
                "setiap bulan",
                "per bulan",
                "bulanan",
                "tren",
            ])
            and any(keyword in question_lower for keyword in [
                "5 bulan",
                "5 tertinggi",
                "tertinggi",
                "top 5",
            ])
        )

        if is_monthly_top_gross_sales_question:
            sql = """
            SELECT
                sales_month,
                gross_sales
            FROM olist.v_monthly_sales
            ORDER BY gross_sales DESC
            LIMIT 5;
            """
        if sql.strip().upper().startswith("INVALID"):
            return {
                "success": False,
                "question": question,
                "generated_sql": None,
                "data": [],
                "columns": [],
                "business_insight": None,
                "error": "Pertanyaan tidak dapat dijawab menggunakan data yang tersedia.",
            }

        result = await query_business_data(sql)
        insight = None
        report = None
        
        is_percentage_question = (
            "persentase" in question.lower()
            and any(keyword in question.lower() for keyword in [
                "delivered",
                "canceled",
                "cancelled",
                "shipped",
                "processing",
                "unavailable",
                "invoiced",
                "approved",
                "dibatalkan",
                "dikirim",
                "diproses",
                "disetujui",
            ])
        )

        if result["success"]:
            # Apply category labels to query results

            for row in result.get("data", []):
                category = row.get("category_name")

                if category:
                    row["category_label"] = format_category_label(category)

            # Generate formatted report
            report = format_query_report(
                question,
                result.get("data", [])
            )

            # Determine insight generation strategy
            question_lower = question.lower()
            columns = result.get("columns", [])
            data = result.get("data", [])

            is_time_series = (
                "sales_month" in columns
                and any(keyword in question_lower for keyword in [
                    "tren", "trend", "setiap bulan", "per bulan", "bulanan"
                ])
            )

            if is_time_series:
                metric = (
                    "gross_sales"
                    if "gross_sales" in columns
                    else "total_gross_sales"
                    if "total_gross_sales" in columns
                    else None
                )

                if metric and data:
                    is_top_months_question = any(
                        keyword in question_lower
                        for keyword in [
                            "tertinggi",
                            "top",
                            "ranking",
                            "peringkat",
                        ]
                    )

                    if is_top_months_question:
                        highest = max(data, key=lambda row: row[metric])

                        month_names = {
                            1: "Januari",
                            2: "Februari",
                            3: "Maret",
                            4: "April",
                            5: "Mei",
                            6: "Juni",
                            7: "Juli",
                            8: "Agustus",
                            9: "September",
                            10: "Oktober",
                            11: "November",
                            12: "Desember",
                        }

                        month = highest["sales_month"]

                        if isinstance(month, str):
                            year, month_number = month[:7].split("-")
                            month_name = month_names[int(month_number)]
                        else:
                            month_name = month_names[month.month]
                            year = month.year

                        formatted_value = (
                            f"{highest[metric]:,.2f}"
                            .replace(",", "X")
                            .replace(".", ",")
                            .replace("X", ".")
                        )

                        insight = (
                            f"Gross sales tertinggi tercatat pada "
                            f"{month_name} {year} sebesar R$ {formatted_value}."
                        )

                    else:
                        insight = calculate_time_series_insight(data, metric)
            elif (
                "payment_type" in columns
                and any(keyword in question_lower for keyword in [
                    "pembayaran",
                    "payment",
                    "metode pembayaran",
                ])
            ):
                payment_field = next(
                    (
                        key for key in [
                            "total_transactions",
                            "total_payment_transactions",
                            "total_payment_value",
                            "total_payment",
                        ]
                        if data and key in data[0]
                    ),
                    None,
                )

                if data and payment_field:
                    highest = max(
                        data,
                        key=lambda row: row[payment_field]
                    )
                    lowest = min(
                        data,
                        key=lambda row: row[payment_field]
                    )

                    highest_name = (
                        highest["payment_type"]
                        .replace("_", " ")
                        .title()
                    )
                    lowest_name = (
                        lowest["payment_type"]
                        .replace("_", " ")
                        .title()
                    )

                    if "transaction" in payment_field:
                        insight = (
                            f"Metode pembayaran yang paling banyak digunakan "
                            f"adalah {highest_name} dengan "
                            f"{highest[payment_field]:,} transaksi. "
                            f"Metode yang paling sedikit digunakan adalah "
                            f"{lowest_name} dengan "
                            f"{lowest[payment_field]:,} transaksi."
                        ).replace(",", ".")
                    else:
                        def format_payment_currency(value):
                            formatted = f"{value:,.2f}"
                            formatted = (
                                formatted.replace(",", "X")
                                .replace(".", ",")
                                .replace("X", ".")
                            )
                            return f"R$ {formatted}"

                        highest_value = format_payment_currency(
                            highest[payment_field]
                        )
                        lowest_value = format_payment_currency(
                            lowest[payment_field]
                        )

                        insight = (
                            f"Metode pembayaran dengan total nilai "
                            f"tertinggi adalah {highest_name} sebesar "
                            f"{highest_value}, sedangkan yang terendah "
                            f"adalah {lowest_name} sebesar {lowest_value}."
                        )
            elif (
                "review_score" in columns
                and any(keyword in question_lower for keyword in [
                    "review", "rating"
                ])
            ):
                count_field = next(
                    (
                        key for key in [
                            "jumlah_review",
                            "total_review_count",
                            "total_reviews",
                        ]
                        if data and key in data[0]
                    ),
                    None,
                )

                if data and count_field:
                    highest = max(
                        data, key=lambda row: row[count_field]
                    )
                    lowest = min(
                        data, key=lambda row: row[count_field]
                    )

                    highest_count = (
                        f"{highest[count_field]:,}".replace(",", ".")
                    )
                    lowest_count = (
                        f"{lowest[count_field]:,}".replace(",", ".")
                    )

                    insight = (
                        f"Rating {highest['review_score']} memiliki "
                        f"jumlah review tertinggi dengan "
                        f"{highest_count} review, sedangkan rating "
                        f"{lowest['review_score']} memiliki jumlah "
                        f"review terendah dengan {lowest_count} review."
                    )
            
            elif (
                "order_status" in columns
                and "persentase" in question_lower
            ):
                percentage_field = next(
                    (
                        key for key in [
                            "persentase_pesanan",
                            "percentage",
                            "persentase",
                        ]
                        if data and key in data[0]
                    ),
                    None,
                )

                if data and percentage_field:
                    highest = max(
                        data,
                        key=lambda row: row[percentage_field]
                    )

                    highest_status = (
                        highest["order_status"].replace("_", " ").title()
                    )

                    highest_percentage = (
                        f"{float(highest[percentage_field]):.2f}"
                        .replace(".", ",")
                    )

                    insight = (
                        f"Status pesanan {highest_status} memiliki "
                        f"persentase tertinggi sebesar "
                        f"{highest_percentage}% dari seluruh pesanan."
                    )
            
            elif any(keyword in question_lower for keyword in [
                "tertinggi", "terendah", "top", "peringkat",
                "ranking", "bandingkan", "distribusi",
                "berdasarkan kategori", "berdasarkan seller",
                "berdasarkan penjual", "berdasarkan metode pembayaran",
                "berdasarkan rating"
            ]):
                try:
                    is_category_item_comparison = (
                        "kategori" in question_lower
                        and any(keyword in question_lower for keyword in [
                            "jumlah pesanan",
                            "total pesanan",
                        ])
                        and any(keyword in question_lower for keyword in [
                            "jumlah item",
                            "item terjual",
                        ])
                        and any(keyword in question_lower for keyword in [
                            "bandingkan",
                            "perbandingan",
                            "tertinggi",
                        ])
                    )

                    if is_category_item_comparison and data:
                        insight_data = sorted(
                            data,
                            key=lambda row: row.get("total_items", 0),
                            reverse=True
                        )

                        top_category = insight_data[0]
                        top_name = format_category_label(top_category.get("category_name"))
                        top_items = int(top_category["total_items"])

                        insight = (
                            f'Kategori "{top_name}" memiliki jumlah item terjual '
                            f'tertinggi sebanyak {top_items:,} item.'
                            .replace(",", ".")
                        )

                        if len(insight_data) > 1:
                            second_category = insight_data[1]
                            second_name = format_category_label(second_category.get("category_name"))
                            second_items = int(second_category["total_items"])

                            insight += (
                                f' Diikuti oleh kategori "{second_name}" '
                                f'dengan {second_items:,} item.'
                                .replace(",", ".")
                            )
                    else:
                        insight_data = []

                        for row in data:
                            insight_row = row.copy()

                            if "category_label" in insight_row:
                                insight_row["category_name"] = insight_row["category_label"]

                            insight_data.append(insight_row)

                        insight = generate_business_insight(question, insight_data)

                except Exception:
                    insight = None
        if (
            result["success"]
            and is_percentage_question
            and "order_status" not in result.get("columns", [])
        ):
            insight = None
            
        return {
            "success": result["success"],
            "question": question,
            "generated_sql": sql,
            "data": result.get("data", []),
            "columns": result.get("columns", []),
            "business_insight": insight,
            "error": result.get("error"),
            "report": report,
        }
    
    except Exception:
        return {
            "success": False,
            "error": "Terjadi kesalahan saat memproses pertanyaan.",
        }
        
def is_document_question(question: str) -> bool:
    question_lower = question.lower()

    document_keywords = [
        "apa itu",
        "apa arti",
        "apa maksud",
        "apa perbedaan",
        "apa beda",
        "jelaskan definisi",
        "definisi",
        "pengertian",
        "konsep",
        "rumus",
        "bagaimana cara menghitung",
        "kebijakan",
        "prosedur",
        "aturan",
        "ketentuan",
        "persyaratan",
        "mekanisme",
        "bagaimana proses",
        "jelaskan proses",
    ]

    return any(
        keyword in question_lower
        for keyword in document_keywords
    )
    
def is_hybrid_question(question: str) -> bool:
    question_lower = question.lower()

    business_keywords = [
        "berapa",
        "jumlah",
        "tertinggi",
        "terendah",
        "ranking",
        "peringkat",
        "tren",
        "persentase",
        "bandingkan",
        "analisis",
        "pesanan",
        "penjualan",
        "payment",
        "seller",
        "review",
    ]

    return (
        is_document_question(question)
        and any(
            keyword in question_lower
            for keyword in business_keywords
        )
    )
    
def is_ambiguous_sales_question(question: str) -> bool:
    question_lower = question.lower().strip()

    ambiguous_terms = [
        "total penjualan",
        "jumlah penjualan",
        "total sales",
        "total penjualan keseluruhan",
        "berapa penjualan",
    ]

    specific_terms = [
        "gross sales",
        "product sales",
        "gross_sale",
        "product_sale",
        "penjualan bruto",
        "penjualan produk",
        "termasuk ongkir",
        "tanpa ongkir",
    ]

    has_ambiguous_term = any(
        term in question_lower for term in ambiguous_terms
    )

    has_specific_term = any(
        term in question_lower for term in specific_terms
    )

    return has_ambiguous_term and not has_specific_term

async def ask_hybrid_question(question: str) -> dict:
    if is_hybrid_question(question):
        document_question = extract_document_question(question)
        rag_result = ask_rag(document_question)
        business_result = await handle_mcp_question(question)

        if not business_result.get("success"):
            return {
                "success": False,
                "question": question,
                "answer": rag_result.get("answer", ""),
                "sources": rag_result.get("sources", []),
                "error": business_result.get("error"),
            }

        business_report = business_result.get("report", "")

        combined_answer = (
            f"### Analisis Data Bisnis\n\n"
            f"{business_report}\n\n"
            f"### Penjelasan Konsep\n\n"
            f"{rag_result.get('answer', '')}"
        )

        return {
            "success": True,
            "question": question,
            "answer": combined_answer,
            "sources": rag_result.get("sources", []),
            "generated_sql": business_result.get("generated_sql"),
            "data": business_result.get("data", []),
            "columns": business_result.get("columns", []),
            "tool_used": business_result.get("tool_used"),
        }

    if is_document_question(question):
        return ask_rag(question)

    return await handle_mcp_question(question)

async def build_mcp_context() -> str:
    tool_descriptions = await get_mcp_tool_descriptions()

    return f"""
Anda adalah AI Business Data Assistant.

DAFTAR MCP TOOLS:
{tool_descriptions}

ATURAN:
1. Gunakan hanya tools yang tersedia dalam daftar.
2. Pahami deskripsi dan input schema setiap tool.
3. Jangan mengarang nama tool atau parameter.
4. query_business_data hanya menerima SQL SELECT.
5. Semua query tetap harus mengikuti aturan keamanan
   dan validasi SQL yang berlaku.
6. list_available_views digunakan untuk mengetahui
   business views yang tersedia.
7. Jangan menganggap metadata tools sebagai hasil query.
"""


async def select_mcp_tool(question: str) -> dict:
    question_lower = question.lower()

    view_keywords = [
        "daftar business views",
        "daftar view",
        "daftar views",
        "business views apa saja",
        "view apa saja",
        "views apa saja",
        "view yang tersedia",
        "views yang tersedia",
        "business views tersedia",
    ]

    if any(keyword in question_lower for keyword in view_keywords):
        tool_name = "list_available_views"
    else:
        tool_name = "query_business_data"

    return {
        "tool_name": tool_name,
        "arguments": {},
    }


async def execute_selected_mcp_tool(selection: dict) -> dict:
    tool_name = selection["tool_name"]
    arguments = selection["arguments"]

    if tool_name == "list_available_views":
        return await list_available_views()

    if tool_name == "query_business_data":
        sql = arguments.get("sql")

        if not sql:
            raise ValueError(
                "SQL harus dibuat melalui generate_sql(), bukan MCP selector."
            )

        return await query_business_data(sql)

    raise ValueError("MCP tool tidak diizinkan.")
async def handle_mcp_question(question: str) -> dict:
    selection = await select_mcp_tool(question)

    if selection["tool_name"] == "list_available_views":
        result = await execute_selected_mcp_tool(selection)

        return {
            "success": True,
            "question": question,
            "tool_used": selection["tool_name"],
            "data": result,
        }

    if selection["tool_name"] == "query_business_data":
        result = await ask_business_question(question)
        result["tool_used"] = selection["tool_name"]
        return result

    raise ValueError("MCP tool tidak diizinkan.")

def extract_document_question(question: str) -> str:
    question_lower = question.lower()

    separators = [
        "dan apa perbedaan",
        "serta apa perbedaan",
        "dan apa beda",
        "serta apa beda",
    ]
    
    concept_separators = [
        " dan berapa",
        ", dan berapa",
        " serta berapa",
        " berapa total",
    ]

    for separator in concept_separators:
        position = question_lower.find(separator)

        if position != -1:
            return question[:position].strip(" ,?")

    for separator in separators:
        position = question_lower.find(separator)

        if position != -1:
            return question[position + len(separator):].strip(" ?")

    return question