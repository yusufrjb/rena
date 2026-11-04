from mcp.server.fastmcp import FastMCP

from sql_executor import execute_sql

mcp = FastMCP(
    "AI Business Data Assistant",
    instructions=(
        "Menyediakan akses analisis data bisnis Olist "
        "melalui query SQL read-only."
    ),
)


@mcp.tool()
def query_business_data(sql: str) -> dict:
    """
    Menjalankan query SQL SELECT pada business views yang diizinkan.

    Gunakan tool ini untuk mengambil data bisnis dari PostgreSQL.
    Query akan divalidasi sebelum dieksekusi.
    """

    return execute_sql(sql)


@mcp.tool()
def list_available_views() -> list[str]:
    """
    Menampilkan daftar business views yang tersedia untuk analisis.
    """

    return [
        "olist.v_order_sales",
        "olist.v_monthly_sales",
        "olist.v_category_sales",
        "olist.v_seller_performance",
        "olist.v_payment_analysis",
        "olist.v_review_analysis",
        "olist.v_payment_transaction",
        "olist.v_order_status_summary",
    ]


if __name__ == "__main__":
    mcp.run(transport="stdio")