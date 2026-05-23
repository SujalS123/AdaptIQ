import re
from typing import List, Dict, Any
from .embedder import LocalFallbackEmbedder
import numpy as np

class CrossEncoderReranker:
    """
    Reranks candidate chunks by comparing dense sentence-level structures
    and exact phrase/term overlaps between the query and candidate documents.
    """
    def __init__(self):
        self.embedder = LocalFallbackEmbedder()

    def _split_into_sentences(self, text: str) -> List[str]:
        # Split by periods, questions, or exclamation marks followed by spaces
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        return [s for s in sentences if len(s.split()) > 2]

    def _calculate_phrase_overlap(self, query: str, document: str) -> float:
        q_words = set(query.lower().split())
        doc_words = set(document.lower().split())
        
        if not q_words:
            return 0.0
            
        intersection = q_words.intersection(doc_words)
        
        # Jaccard overlap of query tokens in document
        overlap_score = len(intersection) / len(q_words)
        
        # Bonus for exact n-gram phrase matches (e.g. "concurrency control")
        clean_q = re.sub(r'[^\w\s]', '', query.lower()).strip()
        clean_doc = re.sub(r'[^\w\s]', '', document.lower()).strip()
        
        # Check 2-grams
        q_words_list = clean_q.split()
        bigram_bonus = 0.0
        for i in range(len(q_words_list) - 1):
            bigram = f"{q_words_list[i]} {q_words_list[i+1]}"
            if bigram in clean_doc:
                bigram_bonus += 0.2
                
        return overlap_score + bigram_bonus

    def rerank(self, query: str, candidates: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Calculates a cross-encoder relevance score combining:
        1. Sentence-level maximum cosine similarity (dense)
        2. Lexical word and bigram overlaps (sparse)
        """
        if not candidates:
            return []

        query_vector = np.array(self.embedder.get_embedding(query))
        reranked_results = []

        for item in candidates:
            doc_text = item.get("text", "")
            if not doc_text:
                doc_text = item.get("metadata", {}).get("text", "")

            # 1. Sentence-level Dense Alignment
            sentences = self._split_into_sentences(doc_text)
            max_sentence_score = 0.0
            
            if sentences:
                sentence_vectors = self.embedder.get_embeddings(sentences)
                for s_vec in sentence_vectors:
                    # Cosine similarity (dot product of normal unit vectors)
                    sim = float(np.dot(query_vector, np.array(s_vec)))
                    if sim > max_sentence_score:
                        max_sentence_score = sim
            else:
                # Fallback to general cosine similarity if no valid sentences found
                doc_vector = np.array(self.embedder.get_embedding(doc_text))
                max_sentence_score = float(np.dot(query_vector, doc_vector))

            # 2. Sparse Lexical Alignment
            lexical_score = self._calculate_phrase_overlap(query, doc_text)

            # Combined Fine-Grained Score (60% Dense alignments, 40% Exact Lexical intersections)
            combined_score = 0.6 * max_sentence_score + 0.4 * min(1.0, lexical_score)
            
            # Preserve original attributes
            new_item = dict(item)
            new_item["rerank_score"] = combined_score
            # Update score for prompt builder to read
            new_item["score"] = combined_score
            reranked_results.append(new_item)

        # Sort descending by new fine-grained rerank score
        reranked_results.sort(key=lambda x: x["rerank_score"], reverse=True)
        return reranked_results[:top_k]
