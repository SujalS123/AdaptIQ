import re
from typing import List, Dict, Any, Tuple

class CragEvaluator:
    """
    Corrective RAG (CRAG) system. Assesses retrieved context quality,
    classifies documents, and runs self-healing query reformulations.
    """
    def __init__(self):
        self.academic_keywords = [
            "database", "dbms", "normal", "1nf", "2nf", "3nf", "bcnf", "4nf", "5nf",
            "query", "sql", "table", "relation", "index", "b+ tree", "b-tree", "key",
            "acid", "transaction", "concurrency", "lock", "deadlock", "isolation",
            "schema", "er diagram", "relational algebra", "join", "projection"
        ]
        self.stop_words = {
            "what", "is", "explain", "how", "does", "the", "a", "an", "why", "who", "where",
            "can", "you", "tell", "me", "about", "please", "query", "question", "slide", "chapter"
        }

    def evaluate(self, query: str, candidates: List[Dict[str, Any]]) -> Tuple[str, List[Dict[str, Any]], str]:
        """
        Grades context relevance:
        - Returns: (status, chunks, reformulated_query)
        - Status values: 'CORRECT', 'AMBIGUOUS', 'INCORRECT'
        """
        if not candidates:
            reformulated = self.reformulate_query(query)
            return "INCORRECT", [], reformulated

        # Compute maximum score among retrieved chunks
        max_score = max(c.get("score", 0.0) for c in candidates)
        
        # Classification thresholds
        if max_score >= 0.55:
            status = "CORRECT"
        elif max_score >= 0.25:
            status = "AMBIGUOUS"
        else:
            status = "INCORRECT"

        reformulated = ""
        if status == "INCORRECT":
            # Initiate self-healing query formulation
            reformulated = self.reformulate_query(query)

        return status, candidates, reformulated

    def reformulate_query(self, query: str) -> str:
        """
        Strips conversational noise and extracts high-value computer science
        and database search tokens to perform a high-precision fallback search.
        """
        # Lowercase and replace non-alphanumeric chars
        clean_query = re.sub(r'[^\w\s\+\-]', ' ', query.lower())
        words = clean_query.split()
        
        # Filter stopwords
        keywords = [w for w in words if w not in self.stop_words and len(w) > 1]
        
        # Priority boost for database core concepts
        academic_hits = [w for w in keywords if w in self.academic_keywords]
        
        # Reconstruct query focusing heavily on technical markers
        if academic_hits:
            # Keep both academic context and other terms
            rebuilt = " ".join(set(academic_hits + keywords))
        else:
            rebuilt = " ".join(set(keywords))
            
        # Fallback to core curriculum index if everything got stripped
        if not rebuilt.strip():
            return "database normal forms sql key index"
            
        return rebuilt
