from sqlalchemy import create_engine, URL
from dotenv import load_dotenv
import os

load_dotenv(override=True)

engine = create_engine(
    URL.create(
        drivername="postgresql+psycopg",
        username="olist_user",
        password=os.getenv("POSTGRES_PASSWORD"),
        host="127.0.0.1",
        port=5433,
        database="olist_analytics",
    )
)