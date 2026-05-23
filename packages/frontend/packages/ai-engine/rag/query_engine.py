from typing import List, Dict, Any
from .embedder import LocalFallbackEmbedder
from .pinecone_client import StatefulMockPineconeClient
from .bm25 import BM25Searcher
from .reranker import CrossEncoderReranker
from .crag import CragEvaluator

class RagQueryEngine:
    """
    State-of-the-art retrieval engine combining Dense Vector Search,
    Sparse BM25 Search, Reciprocal Rank Fusion, Corrective RAG (CRAG) self-healing,
    and a fine-grained Cross-Encoder Reranker.
    """
    def __init__(self):
        self.embedder = LocalFallbackEmbedder()
        self.vector_db = StatefulMockPineconeClient()
        self.bm25_searcher = BM25Searcher()
        self.crag_evaluator = CragEvaluator()
        self.reranker = CrossEncoderReranker()
        
        # Mirror Pinecone seeded slide texts into BM25
        self._seed_default_bm25_corpus()

    def _seed_default_bm25_corpus(self):
        dbms_namespace = "dbms-gate"
        if dbms_namespace in self.vector_db.db:
            for doc in self.vector_db.db[dbms_namespace]:
                self.bm25_searcher.add_document(
                    namespace=dbms_namespace,
                    doc_id=doc["id"],
                    text=doc["metadata"]["text"]
                )

    def add_document(self, namespace: str, doc_id: str, text: str, metadata: Dict[str, Any]):
        """Indices a document into both dense vector DB and sparse BM25 indexers."""
        vector = self.embedder.get_embedding(text)
        # 1. Dense Pinecone index
        self.vector_db.upsert(namespace, doc_id, vector, metadata)
        # 2. Sparse BM25 index
        self.bm25_searcher.add_document(namespace, doc_id, text)

    def _reciprocal_rank_fusion(
        self,
        dense_results: List[Dict[str, Any]],
        sparse_results: List[Dict[str, Any]],
        top_n: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Synthesizes ranks from dense and sparse queries using Reciprocal Rank Fusion (RRF).
        RRF Score = 1 / (60 + Rank_dense) + 1 / (60 + Rank_sparse)
        """
        rrf_scores: Dict[str, float] = {}
        items_map: Dict[str, Dict[str, Any]] = {}
        
        # Helper to index maps
        for rank, item in enumerate(dense_results):
            doc_id = item["id"]
            items_map[doc_id] = item
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (60.0 + rank))
            
        for rank, item in enumerate(sparse_results):
            doc_id = item["id"]
            if doc_id not in items_map:
                items_map[doc_id] = {
                    "id": item["id"],
                    "score": item["score"],
                    "metadata": {"text": item["text"]}
                }
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (60.0 + rank))

        # Re-score items and scale to [0, 1] range for CRAG thresholds
        fused_results = []
        for doc_id, score in rrf_scores.items():
            item = items_map[doc_id]
            # Normalize RRF scores: mapping high ranks (~0.033) to standard confidence levels
            norm_score = min(1.0, score * 30.0)
            
            new_item = dict(item)
            new_item["score"] = norm_score
            fused_results.append(new_item)

        # Sort by fused score descending
        fused_results.sort(key=lambda x: x["score"], reverse=True)
        return fused_results[:top_n]

    def retrieve_context(self, query: str, namespace: str = "dbms-gate", top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Performs unified multi-stage RAG retrieval:
        1. Dense + Sparse search parallel query
        2. Reciprocal Rank Fusion (RRF) blending
        3. Corrective RAG relevance gating
        4. Self-Healing Query Reformulation fallbacks (on INCORRECT status)
        5. Cross-Encoder Fine-Grained Reranking
        """
        # Step 1 & 2: Initial retrieval & fusion
        query_vector = self.embedder.get_embedding(query)
        dense_candidates = self.vector_db.query(namespace, query_vector, top_k=8)
        sparse_candidates = self.bm25_searcher.query(namespace, query, top_k=8)
        
        fused_candidates = self._reciprocal_rank_fusion(dense_candidates, sparse_candidates)

        # Step 3: CRAG Evaluation
        status, graded_candidates, reformulated = self.crag_evaluator.evaluate(query, fused_candidates)

        # Step 4: Self-Healing Loop
        if status == "INCORRECT":
            print(f"[INFO] CRAG Status: INCORRECT (Score < 0.25). Reformulating query to: '{reformulated}'")
            # Retry with reformulated query
            retry_vector = self.embedder.get_embedding(reformulated)
            retry_dense = self.vector_db.query(namespace, retry_vector, top_k=8)
            retry_sparse = self.bm25_searcher.query(namespace, reformulated, top_k=8)
            
            fused_candidates = self._reciprocal_rank_fusion(retry_dense, retry_sparse)
            # Re-evaluate
            status, graded_candidates, _ = self.crag_evaluator.evaluate(reformulated, fused_candidates)
            
            if status == "INCORRECT":
                # Final failover: Pull core curriculum notes (dbms-gate) so student is guided rather than failed
                print("[INFO] CRAG Retry also INCORRECT. Falling back to default DBMS-Gate namespace.")
                default_vector = self.embedder.get_embedding(query)
                default_dense = self.vector_db.query("dbms-gate", default_vector, top_k=top_k)
                default_sparse = self.bm25_searcher.query("dbms-gate", query, top_k=top_k)
                graded_candidates = self._reciprocal_rank_fusion(default_dense, default_sparse)

        # Step 5: Cross-Encoder Reranking
        final_reranked = self.reranker.rerank(query, graded_candidates, top_k=top_k)
        
        # Inject context ambiguity warning for intermediate grades
        if status == "AMBIGUOUS" and final_reranked:
            for item in final_reranked:
                if "metadata" in item:
                    item["metadata"]["is_partial"] = True
                    
        return final_reranked
