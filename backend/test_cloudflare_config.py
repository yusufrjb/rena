
import os
from dotenv import load_dotenv

load_dotenv(override=True)

account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
api_token = os.getenv("CLOUDFLARE_API_TOKEN")
model = os.getenv("CLOUDFLARE_MODEL")

print("Account ID:", "OK" if account_id else "MISSING")
print("API Token:", "OK" if api_token else "MISSING")
print("Model:", model or "Using default model")
