
import os
import httpx
from dotenv import load_dotenv

load_dotenv(override=True)

ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
MODEL = os.getenv(
    "CLOUDFLARE_MODEL",
    "@cf/meta/llama-3.1-8b-instruct",
)

API_URL = (
    f"https://api.cloudflare.com/client/v4/accounts/"
    f"{ACCOUNT_ID}/ai/run/{MODEL}"
)


def generate_response(prompt: str) -> str:
    if not ACCOUNT_ID or not API_TOKEN:
        raise ValueError("Cloudflare credentials belum dikonfigurasi.")

    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "messages": [
            {
                "role": "user",
                "content": prompt,
            }
        ],
        "max_tokens": 1024,
    }

    response = httpx.post(
        API_URL,
        headers=headers,
        json=payload,
        timeout=60,
    )

    response.raise_for_status()

    result = response.json()

    if not result.get("success"):
        raise RuntimeError("Cloudflare AI gagal menghasilkan respons.")

    return result["result"]["response"]
