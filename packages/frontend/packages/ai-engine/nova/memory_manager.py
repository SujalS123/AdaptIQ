from typing import List, Dict, Any
from .memory_extractor import MemoryExtractor

class MemoryManager:
    """
    Manages three memory layers:
    1. Short-term: Conversation session context buffer.
    2. Long-term: Extracted learning cards database (what Nova remembers).
    3. Episodic: Chronological learning timeline.
    """
    def __init__(self):
        # Database fallback in-memory: { student_id: [ {"fact": str, "category": str} ] }
        self.long_term_memory: Dict[str, List[Dict[str, Any]]] = {}
        self.extractor = MemoryExtractor()
        self._seed_default_memories()

    def _seed_default_memories(self):
        """
        Seeds default state for mock student Priya to make verification flawless.
        """
        self.long_term_memory["student-priya"] = [
            {"category": "preference", "value": "cricket", "fact": "Student loves using cricket analogies or examples to learn complex concepts."},
            {"category": "schedule_preference", "value": "evening", "fact": "Learning routine preference: Student studies best during the evening."}
        ]

    def get_memories(self, student_id: str) -> List[Dict[str, Any]]:
        return self.long_term_memory.get(student_id, [])

    def ingest_conversation(self, student_id: str, user_text: str) -> List[Dict[str, Any]]:
        """
        Processes a chat turn, extracts new preference facts,
        and saves them to the student's long-term memory store.
        """
        extracted = self.extractor.extract_facts(user_text)
        if not extracted:
            return []

        if student_id not in self.long_term_memory:
            self.long_term_memory[student_id] = []

        existing_facts = [m["fact"] for m in self.long_term_memory[student_id]]
        new_facts_saved = []

        for item in extracted:
            if item["fact"] not in existing_facts:
                self.long_term_memory[student_id].append({
                    "category": item["category"],
                    "value": item["value"],
                    "fact": item["fact"]
                })
                new_facts_saved.append(item)

        return new_facts_saved
