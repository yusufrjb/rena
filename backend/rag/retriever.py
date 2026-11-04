from pathlib import Path

from langchain_community.vectorstores import FAISS

from .embeddings import CloudflareEmbeddings

VECTOR_DIR = Path(__file__).resolve().parents[2] / "data" / "vector_store"
from functools import lru_cache
@lru_cache(maxsize=1)

def get_retriever():
    if not VECTOR_DIR.exists():
        raise FileNotFoundError("FAISS vector store belum tersedia.")

    embeddings = CloudflareEmbeddings()

    vector_store = FAISS.load_local(
        str(VECTOR_DIR),
        embeddings,
        allow_dangerous_deserialization=True,
    )

    return vector_store.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "k": 3,
            "score_threshold": 0.45,
        },
    )


if __name__ == "__main__":
    retriever = get_retriever()

    question = "Apa perbedaan gross sales dan product sales?"
    results = retriever.invoke(question)

    print("Pertanyaan:", question)
    print("Jumlah hasil:", len(results))

    for index, document in enumerate(results, start=1):
        print(f"\nHasil {index}")
        print("Sumber:", document.metadata.get("source"))
        print("Konten:", document.page_content)

def test_relevance(question: str):
    embeddings = CloudflareEmbeddings()

    vector_store = FAISS.load_local(
        str(VECTOR_DIR),
        embeddings,
        allow_dangerous_deserialization=True,
    )

    results = vector_store.similarity_search_with_relevance_scores(
        question,
        k=3,
    )

    print(f"Total hasil: {len(results)}")

    for index, (document, score) in enumerate(results, start=1):
        print(f"\nHasil {index}")
        print(f"Score: {score:.4f}")
        print(f"Source: {document.metadata.get('source')}")
        print(f"Content: {document.page_content[:300]}")