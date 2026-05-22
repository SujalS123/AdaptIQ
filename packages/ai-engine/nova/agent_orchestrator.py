from typing import Dict, Any, List
from rag.query_engine import RagQueryEngine
from rag.prompt_builder import build_socratic_prompt
from .memory_manager import MemoryManager
from .groq_client import GroqClient

class NovaAgentOrchestrator:
    """
    Unified AI orchestrator running the conversation processing loop.
    Coalesces RAG context, active psychometrics, and cognitive memory cards
    to formulate perfect Socratic explanations.
    """
    def __init__(self):
        self.rag_engine = RagQueryEngine()
        self.memory_manager = MemoryManager()
        self.groq_client = GroqClient()

    def process_query(
        self,
        student_id: str,
        text: str,
        current_theta: float,
        recent_errors: List[str] = None
    ) -> Dict[str, Any]:
        """
        Orchestrates full Socratic loop:
        1. RAG Context Retrieval
        2. Cognitive Memory Retrieval
        3. Fact Extraction & Memory Update
        4. Unified Prompt Synthesis
        5. Socratic Response Generation
        """
        # 1. RAG Retrieve
        docs = self.rag_engine.retrieve_context(text, namespace="dbms-gate", top_k=2)

        # 2. Extract & Update Memory from current utterance
        new_memories = self.memory_manager.ingest_conversation(student_id, text)

        # 3. Retrieve all active memories
        memories = self.memory_manager.get_memories(student_id)

        # 4. Formulate Prompt
        prompt = build_socratic_prompt(
            student_query=text,
            retrieved_documents=docs,
            student_memory=memories,
            current_theta=current_theta,
            recent_errors=recent_errors
        )

        # 5. Generative Response Selection (Groq API with Mock Fallback)
        response = None
        if self.groq_client.is_configured():
            response = self.groq_client.generate_socratic_response(prompt, text)
            if response:
                print(f"[INFO] Generated live response from Groq API using model {self.groq_client.model}.")

        if not response:
            # Fallback to local high-premium mock templates
            text_lower = text.lower()
            if "normal" in text_lower or "database" in text_lower or "1nf" in text_lower:
                response = (
                    "A great question! Let's check slide 14. Normalization is about reducing redundancy. "
                    "Since you prefer cricket analogies: imagine storing a match database, but repeating every player's birthdate "
                    "next to every single run they score. If a player updates their phone number, how many rows would we have to change? "
                    "And what kinds of anomalies would happen if we forget to update even one row?"
                )
            elif "cricket" in text_lower:
                response = (
                    "Exactly! Cricket is a perfect lens. Organizing a database is like keeping batsman stats separated "
                    "from tournament schedules. What would happen if we merged them and a tournament got canceled?"
                )
            elif "mle" in text_lower or "irt" in text_lower:
                response = (
                    "Ah, studying the backend algorithms! Maximum Likelihood Estimation adjusts your ability parameter theta (θ) "
                    "based on item difficulties. If you get hard questions right, θ shifts up. Where do you think we should set the prior θ?"
                )
            else:
                response = (
                    f"That's an interesting point! Connecting this to your GATE syllabus: how do you feel this relates to "
                    "functional dependencies, or should we examine Professor Sharma's class slides first?"
                )

        return {
            "student_id": student_id,
            "response": response,
            "prompt_compiled": prompt,
            "new_memories_extracted": new_memories,
            "all_current_memories": memories
        }
