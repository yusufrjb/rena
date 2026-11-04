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
