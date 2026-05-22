from typing import List, Dict, Any
from .embedder import LocalFallbackEmbedder
from .pinecone_client import StatefulMockPineconeClient

class RagQueryEngine:
    def __init__(self):
        self.embedder = LocalFallbackEmbedder()
        self.vector_db = StatefulMockPineconeClient()

    def retrieve_context(self, query: str, namespace: str = "dbms-gate", top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Embeds query and retrieves top_k documents from stateful mock Pinecone db.
        """
        query_vector = self.embedder.get_embedding(query)
        return self.vector_db.query(namespace, query_vector, top_k)
