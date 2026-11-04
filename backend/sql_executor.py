
from sqlalchemy import text
from sqlglot import exp, parse_one
from db import engine
from sql_validator import validate_sql
import sys

MAX_ROWS = 100


def execute_sql(query: str) -> dict:
    is_valid, message = validate_sql(query)

    if not is_valid:
        return {
            "success": False,
            "error": message,
            "data": [],
        }

    try:
        # Tambahkan LIMIT jika query belum memilikinya.
        parsed_query = parse_one(query, read="postgres")

        limit = parsed_query.args.get("limit")

        if limit is None:
            parsed_query = parsed_query.limit(MAX_ROWS)
        else:
            limit_expression = limit.expression

            if (
                not isinstance(limit_expression, exp.Literal)
                or not limit_expression.is_int
                or int(limit_expression.this) > MAX_ROWS
            ):
                parsed_query = parsed_query.limit(MAX_ROWS)

        safe_query = parsed_query.sql(dialect="postgres")

        with engine.connect() as connection:
            with connection.begin():
                connection.execute(
                    text("SET TRANSACTION READ ONLY")
                )
                connection.execute(
                    text("SET LOCAL statement_timeout = '15s'")
                )

                result = connection.execute(text(safe_query))

                columns = list(result.keys())
                rows = result.fetchmany(MAX_ROWS)

                data = [
                    dict(zip(columns, row))
                    for row in rows
                ]

        return {
            "success": True,
            "columns": columns,
            "data": data,
        }

    except Exception as error:
        print(f"SQL EXECUTION ERROR: {e}", file=sys.stderr)
        print(f"FAILED SQL: {query}")

        return {
            "success": False,
            "error": "Query gagal dieksekusi.",
            "data": [],
        }
