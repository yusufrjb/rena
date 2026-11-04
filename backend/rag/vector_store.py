from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

from .document_loader import load_documents
from .embeddings import CloudflareEmbeddings

VECTOR_DIR = Path(__file__).resolve().parents[2] / "data" / "vector_store"


def create_vector_store():
    documents = load_documents()

    if not documents:
        raise ValueError("Belum ada dokumen di data/documents.")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = splitter.split_documents(documents)

    embeddings = CloudflareEmbeddings()

    vector_store = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings,
    )

    VECTOR_DIR.mkdir(parents=True, exist_ok=True)
    vector_store.save_local(str(VECTOR_DIR))

    return vector_store


if __name__ == "__main__":
    store = create_vector_store()

    print("FAISS vector store berhasil dibuat.")
    print("Jumlah chunks:", store.index.ntotal)
    print("Lokasi:", VECTOR_DIR)