import os
import httpx

from dotenv import load_dotenv
from langchain_core.embeddings import Embeddings

load_dotenv(override=True)

ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
EMBEDDING_MODEL = "@cf/baai/bge-m3"

API_URL = (
    f"https://api.cloudflare.com/client/v4/accounts/"
    f"{ACCOUNT_ID}/ai/run/{EMBEDDING_MODEL}"
)


class CloudflareEmbeddings(Embeddings):

    def __init__(self):
        if not ACCOUNT_ID or not API_TOKEN:
            raise ValueError("Cloudflare credentials belum dikonfigurasi.")

        self.headers = {
            "Authorization": f"Bearer {API_TOKEN}",
            "Content-Type": "application/json",
        }

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        embeddings = []

        for start in range(0, len(texts), 16):
            batch = texts[start:start + 16]

            response = httpx.post(
                API_URL,
                headers=self.headers,
                json={"text": batch},
                timeout=60,
            )

            response.raise_for_status()
            result = response.json()

            if not result.get("success"):
                raise RuntimeError("Cloudflare embedding gagal.")

            embeddings.extend(result["result"]["data"])

        return embeddings

    def embed_query(self, text: str) -> list[float]:
        return self.embed_documents([text])[0]


if __name__ == "__main__":
    embeddings = CloudflareEmbeddings()

    vectors = embeddings.embed_documents([
        "Kebijakan pengiriman pesanan pelanggan.",
        "Metode pembayaran dalam transaksi.",
    ])

    print("Embedding berhasil dibuat.")
    print("Jumlah teks:", len(vectors))
    print("Dimensi vector:", len(vectors[0]))