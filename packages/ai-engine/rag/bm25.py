import math
import re
from typing import List, Dict, Any, Set

class BM25Searcher:
    """
    Stateful in-memory Okapi BM25 Sparse Indexing engine.
    Supports namespaced text documents, dynamic indexing, and IDF caching.
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        
        # Database schema: { namespace: { doc_id: { "text": str, "tokens": List[str], "length": int } } }
        self.corpus: Dict[str, Dict[str, Dict[str, Any]]] = {}
        
        # Stopwords list to optimize search precision
        self.stopwords: Set[str] = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent",
            "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant",
            "cannot", "could", "couldnt", "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during",
            "each", "few", "for", "from", "further", "had", "hadnt", "has", "hasnt", "have", "havent", "having",
            "he", "hed", "hell", "hes", "her", "here", "heres", "hers", "herself", "him", "himself", "his", "how",
            "hows", "i", "id", "ill", "im", "ive", "if", "in", "into", "is", "isnt", "it", "its", "itself", "lets",
            "me", "more", "most", "mustnt", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only",
            "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shant", "she", "shed",
            "shell", "shes", "should", "shouldnt", "so", "some", "such", "than", "that", "thats", "the", "their",
            "theirs", "them", "themselves", "then", "there", "theres", "these", "they", "theyd", "theyll",
            "theyre", "theyve", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
            "wasnt", "we", "wed", "well", "were", "weve", "werent", "what", "whats", "when", "whens", "where",
            "wheres", "which", "while", "who", "whos", "whom", "why", "whys", "with", "wont", "would", "wouldnt",
            "you", "youd", "youll", "youre", "youve", "your", "yours", "yourself", "yourselves"
        }

    def _tokenize(self, text: str) -> List[str]:
        # Convert to lowercase and split by word characters
        words = re.findall(r'\b\w+\b', text.lower())
        return [w for w in words if w not in self.stopwords and len(w) > 1]

    def add_document(self, namespace: str, doc_id: str, text: str):
        """Indexes a single document in a namespace."""
        if namespace not in self.corpus:
            self.corpus[namespace] = {}
            
        tokens = self._tokenize(text)
        self.corpus[namespace][doc_id] = {
            "text": text,
            "tokens": tokens,
            "length": len(tokens)
        }

    def _get_doc_freqs(self, namespace: str) -> Dict[str, int]:
        """Computes document frequency for all unique terms in a namespace."""
        df: Dict[str, int] = {}
        if namespace not in self.corpus:
            return df
            
        for doc in self.corpus[namespace].values():
            unique_tokens = set(doc["tokens"])
            for t in unique_tokens:
                df[t] = df.get(t, 0) + 1
        return df

    def query(self, namespace: str, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Runs Okapi BM25 score calculation on a namespace, returning the top_k matches.
        """
        if namespace not in self.corpus or not self.corpus[namespace]:
            return []

        query_tokens = self._tokenize(query_text)
        if not query_tokens:
            return []

        docs = self.corpus[namespace]
        N = len(docs)
        
        # Calculate doc frequencies for IDF
        df = self._get_doc_freqs(namespace)
        
        # Calculate average document length
        total_len = sum(d["length"] for d in docs.values())
        avgdl = total_len / N if N > 0 else 1.0

        scores = []
        for doc_id, doc in docs.items():
            doc_len = doc["length"]
            doc_tokens = doc["tokens"]
            
            # Fast count of term frequencies in this document
            tf = {}
            for t in doc_tokens:
                tf[t] = tf.get(t, 0) + 1

            score = 0.0
            for term in query_tokens:
                if term not in tf:
                    continue
                    
                # Compute IDF with standard smoothing
                n_q = df.get(term, 0)
                idf = math.log(((N - n_q + 0.5) / (n_q + 0.5)) + 1.0)
                
                # BM25 Term Score
                f_q = tf[term]
                numerator = f_q * (self.k1 + 1.0)
                denominator = f_q + self.k1 * (1.0 - self.b + self.b * (doc_len / avgdl))
                score += idf * (numerator / denominator)

            if score > 0.0:
                scores.append({
                    "id": doc_id,
                    "score": score,
                    "text": doc["text"]
                })

        # Sort by score descending
        scores.sort(key=lambda x: x["score"], reverse=True)
        return scores[:top_k]
