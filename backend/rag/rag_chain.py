import sys
from pathlib import Path
from functools import lru_cache
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from .retriever import get_retriever
from .context_cache import get_cached_business_context
from llm_client import generate_response

@lru_cache(maxsize=128)
def get_cached_context(question: str) -> tuple[str, tuple[str, ...]]:
    retriever = get_retriever()
    documents = retriever.invoke(question)

    context = "\n\n".join(
        f"[Sumber: {doc.metadata.get('source', 'Unknown')}]\n"
        f"{doc.page_content}"
        for doc in documents
    )

    sources = tuple(dict.fromkeys(
        doc.metadata.get("source", "Unknown")
        for doc in documents
    ))

    return context, sources

def ask_rag(question: str) -> dict:
    context, sources = get_cached_business_context()

    if not context.strip():
        context, sources = get_cached_context(question)

    if not context:
        return {
            "success": True,
            "question": question,
            "answer": "Informasi tidak ditemukan dalam dokumen.",
            "sources": [],
        }

    prompt = f"""

Anda adalah AI Business Assistant yang menjawab pertanyaan
berdasarkan dokumen bisnis yang diberikan.

ATURAN:
1. Jawab pertanyaan hanya berdasarkan informasi dalam konteks.
2. Jika definisi atau informasi yang ditanyakan tersedia,
   wajib berikan jawaban berdasarkan informasi tersebut.
3. Jangan menolak menjawab jika konteks mengandung informasi
   yang relevan.
4. Jangan menggunakan pengetahuan di luar konteks.
5. Jangan mengarang informasi.
6. Jika informasi memang tidak tersedia dalam konteks,
   jawab: "Informasi tidak ditemukan dalam dokumen."
7. Gunakan bahasa Indonesia yang jelas dan ringkas.
8. Untuk pertanyaan perbedaan, jelaskan perbedaan kedua konsep
   secara langsung.
9. Jika pertanyaan juga meminta analisis angka atau data bisnis,
   cukup jelaskan definisi, konsep, dan rumusnya.
10. Jangan menghitung, menebak, atau membuat nilai numerik
    berdasarkan konteks dokumen.
11. Jangan mengubah jumlah pesanan menjadi nilai penjualan
    atau sebaliknya.
12. Jika hasil analisis SQL tersedia di bagian lain aplikasi,
    jangan mencoba menggantikan atau menghitung ulang hasil tersebut.

KONTEKS:
{context}

PERTANYAAN:
{question}

JAWABAN:
"""

    answer = generate_response(prompt)

    return {
        "success": True,
        "question": question,
        "answer": answer,
        "sources": list(sources),
    }


if __name__ == "__main__":
    question = "Apa perbedaan gross sales dan product sales?"

    result = ask_rag(question)

    print("\nPertanyaan:", result["question"])
    print("\nJawaban:", result["answer"])
    print("\nSumber:", result["sources"])
