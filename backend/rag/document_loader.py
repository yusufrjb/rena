from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader, TextLoader

DOCUMENT_DIR = Path(__file__).resolve().parents[2] / "data" / "documents"


def load_documents():
    documents = []

    for file_path in DOCUMENT_DIR.rglob("*"):
        if not file_path.is_file():
            continue

        suffix = file_path.suffix.lower()

        try:
            if suffix == ".pdf":
                loader = PyPDFLoader(str(file_path))
            elif suffix == ".txt":
                loader = TextLoader(str(file_path), encoding="utf-8")
            else:
                continue

            loaded_docs = loader.load()

            for document in loaded_docs:
                document.metadata["source"] = file_path.name

            documents.extend(loaded_docs)

        except Exception as error:
            print(f"Gagal membaca {file_path.name}: {error}")

    return documents


if __name__ == "__main__":
    docs = load_documents()
    print(f"Total dokumen/pages: {len(docs)}")

    for document in docs[:5]:
        print({
            "source": document.metadata.get("source"),
            "content_preview": document.page_content[:150]
        })
        
from functools import lru_cache

from .document_loader import load_documents


@lru_cache(maxsize=1)
def get_cached_business_context() -> tuple[str, tuple[str, ...]]:
    documents = load_documents()

    context = "\n\n".join(
        f"[Sumber: {document.metadata.get('source', 'Unknown')}]\n"
        f"{document.page_content}"
        for document in documents
    )

    sources = tuple(dict.fromkeys(
        document.metadata.get("source", "Unknown")
        for document in documents
    ))

    return context, sources