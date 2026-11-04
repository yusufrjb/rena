
from text_to_sql import generate_sql

question = "Berapa total penjualan setiap kategori produk? Urutkan dari yang tertinggi."

try:
    sql = generate_sql(question)

    print("QUESTION:")
    print(question)

    print("\nGENERATED SQL:")
    print(sql)

except Exception as error:
    print("\nERROR:")
    print(error)
