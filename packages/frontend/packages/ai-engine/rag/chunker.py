from typing import List, Dict, Any

def create_sliding_window_chunks(
    text: str,
    chunk_size_words: int = 150,
    overlap_words: int = 30
) -> List[Dict[str, Any]]:
    """
    Splits text into overlapping sliding window chunks for high-premium RAG indexing.
    
    Returns:
        List[Dict[str, Any]]: List of chunk dicts containing:
            - "chunk_id": int
            - "text": str
            - "word_count": int
    """
    if not text:
        return []

    words = text.split()
    total_words = len(words)
    chunks = []
    chunk_id = 0

    if total_words <= chunk_size_words:
        return [{"chunk_id": 0, "text": text, "word_count": total_words}]

    start = 0
    while start < total_words:
        end = min(start + chunk_size_words, total_words)
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)
        
        chunks.append({
            "chunk_id": chunk_id,
            "text": chunk_text,
            "word_count": len(chunk_words)
        })
        
        chunk_id += 1
        # Advance starting point by size - overlap
        start += (chunk_size_words - overlap_words)
        
        # Prevent infinite loops if values are incorrectly set
        if chunk_size_words <= overlap_words:
            break

    return chunks
