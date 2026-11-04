
import sqlglot
from sqlglot import exp

ALLOWED_VIEWS = {
    "v_order_sales",
    "v_monthly_sales",
    "v_category_sales",
    "v_seller_performance",
    "v_payment_analysis",
    "v_review_analysis",
    "v_payment_transaction",
    "v_order_status_summary",
}

BLOCKED_FUNCTIONS = {
    "pg_sleep",
    "pg_read_file",
    "pg_read_binary_file",
    "pg_ls_dir",
    "pg_stat_file",
    "pg_logfile_rotate",
    "dblink",
    "dblink_exec",
    "lo_import",
    "lo_export",
    "set_config",
}


def validate_sql(query: str) -> tuple[bool, str]:
    if not query or not query.strip():
        return False, "Query kosong."

    try:
        statements = sqlglot.parse(query, read="postgres")
    except sqlglot.errors.ParseError:
        return False, "SQL tidak valid."

    if len(statements) != 1 or statements[0] is None:
        return False, "Hanya satu SQL statement yang diizinkan."

    statement = statements[0]

    if not isinstance(statement, exp.Select):
        return False, "Hanya SELECT query yang diizinkan."

    # Cegah SELECT INTO
    if statement.args.get("into") is not None:
        return False, "SELECT INTO tidak diizinkan."
    
        # Blokir fungsi PostgreSQL yang berisiko
    for function in statement.find_all(exp.Func):
        if isinstance(function, exp.Anonymous):
            function_name = function.name.lower()
        else:
            function_name = function.sql_name().lower()

        if function_name in BLOCKED_FUNCTIONS:
            return False, f"Fungsi '{function_name}' tidak diizinkan."

    # Periksa seluruh tabel/view yang direferensikan
    tables = statement.find_all(exp.Table)

    if not tables:
        return False, "Query harus membaca business view."

    for table in tables:
        if table.name.lower() not in ALLOWED_VIEWS:
            return False, f"Tabel/view '{table.name}' tidak diizinkan."

        if not table.db or table.db.lower() != "olist":
            return False, "Setiap business view wajib menggunakan schema olist."

        if table.catalog:
            return False, "Akses database lintas katalog tidak diizinkan."

    return True, "Query valid."
