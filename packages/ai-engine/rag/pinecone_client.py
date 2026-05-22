import numpy as np
from typing import List, Dict, Any
from .embedder import LocalFallbackEmbedder

class StatefulMockPineconeClient:
    """
    Stateful in-memory Vector Database acting as a zero-cost local fallback
    for Pinecone. Supports namespaces (different subjects) and Cosine Similarity searches.
    """
    def __init__(self):
        # Database structure: { namespace: [ { "id": str, "vector": List[float], "metadata": Dict } ] }
        self.db: Dict[str, List[Dict[str, Any]]] = {}
        self.embedder = LocalFallbackEmbedder()
        self._seed_default_corpus()

    def _seed_default_corpus(self):
        """
        Seeds the vector DB with premium GATE DBMS course content
        so that RAG actually retrieves real, helpful course materials!
        """
        dbms_namespace = "dbms-gate"
        slides_text = [
            "Professor Sharma's DBMS Slide 14: Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity. It involves dividing large tables into smaller, linked tables and defining relationships between them.",
            "Professor Sharma's DBMS Slide 15: First Normal Form (1NF) requires that data is organized in relations (tables) where all attributes are atomic values, and there are no repeating groups.",
            "Professor Sharma's DBMS Slide 16: Second Normal Form (2NF) is achieved when a table is in 1NF and all non-prime attributes are fully functionally dependent on the entire primary key, eliminating partial functional dependencies.",
            "Professor Sharma's DBMS Slide 17: Third Normal Form (3NF) requires a relation to be in 2NF, and no non-prime attribute should be transitively dependent on the primary key (no X -> Y -> Z transitive chains).",
            "Professor Sharma's DBMS Slide 18: Boyce-Codd Normal Form (BCNF) is a stronger version of 3NF. A relation is in BCNF if for every non-trivial functional dependency X -> Y, X is a superkey.",
            "GATE Syllabus Overview: Functional dependencies are constraints derived from the real-world relationships of data. A dependency X -> Y means X uniquely determines Y."
        ]
        
        for i, text in enumerate(slides_text):
            vector = self.embedder.get_embedding(text)
            self.upsert(
                namespace=dbms_namespace,
                vector_id=f"chunk-{i}",
                vector=vector,
                metadata={"text": text, "source": "class_slides", "slide_number": 14 + i}
            )

    def upsert(self, namespace: str, vector_id: str, vector: List[float], metadata: Dict[str, Any]):
        if namespace not in self.db:
            self.db[namespace] = []
        # Check if already exists
        for item in self.db[namespace]:
            if item["id"] == vector_id:
                item["vector"] = vector
                item["metadata"] = metadata
                return
        self.db[namespace].append({
            "id": vector_id,
            "vector": vector,
            "metadata": metadata
        })

    def query(self, namespace: str, query_vector: List[float], top_k: int = 3) -> List[Dict[str, Any]]:
        if namespace not in self.db:
            return []

        candidates = self.db[namespace]
        results = []

        q_vec = np.array(query_vector)

        for item in candidates:
            i_vec = np.array(item["vector"])
            # Compute cosine similarity (dot product of L2 normalized vectors)
            score = float(np.dot(q_vec, i_vec))
            results.append({
                "id": item["id"],
                "score": score,
                "metadata": item["metadata"]
            })

        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]
