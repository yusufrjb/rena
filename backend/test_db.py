import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL

load_dotenv(override=True)

DATABASE_URL = URL.create(
    drivername="postgresql+psycopg",
    username="olist_user",
    password=os.getenv("POSTGRES_PASSWORD"),
    host="127.0.0.1",
    port=5433,
    database="olist_analytics",
)

engine = create_engine(DATABASE_URL)

with engine.connect() as connection:
    result = connection.execute(text("SELECT version();"))
    print("SQLAlchemy berhasil terhubung!")
    print(result.scalar())