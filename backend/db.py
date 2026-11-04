
import os

from dotenv import load_dotenv
from sqlalchemy import URL, create_engine

load_dotenv(override=False)

engine = create_engine(
    URL.create(
        drivername="postgresql+psycopg",
        username=os.getenv("POSTGRES_USER", "olist_user"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("POSTGRES_HOST", "127.0.0.1"),
        port=int(os.getenv("POSTGRES_PORT", "5433")),
        database=os.getenv("POSTGRES_DB", "olist_analytics"),
    ),
    pool_pre_ping=True,
)
