import re
from typing import List, Dict, Any

class MemoryExtractor:
    """
    NLP memory extraction daemon. Distills raw user utterances
    into permanent, structured cognitive preference cards (memories).
    """
    def __init__(self):
        # NLP keyword patterns to match study preferences, hobbies, exam targets, and schedules
        self.rules = [
            (r"(?:prefer|like|love|explain with)\s+([\w\s]{2,15})\s+(?:examples|illustrations)", "preference"),
            (r"(?:preparing for|target exam|study for)\s+([\w\s\-]{2,10})", "exam"),
            (r"(?:exam is on|test date is|exam date is)\s+([\w\s\d,]{5,20})", "exam_date"),
            (r"(?:best time to study|study best in)\s+([\w\s]{3,15})", "schedule_preference"),
            (r"(?:struggle with|difficult to understand|hard to learn)\s+([\w\s\-]{2,20})", "weakness")
        ]

    def extract_facts(self, text: str) -> List[Dict[str, Any]]:
        """
        Extracts key learning preference cards from raw text inputs.
        """
        facts = []
        if not text:
            return facts

        text_lower = text.lower()
        
        for pattern, category in self.rules:
            match = re.search(pattern, text_lower)
            if match:
                value = match.group(1).strip()
                
                # Format friendly output fact
                if category == "preference":
                    fact = f"Student loves using {value} analogies or examples to learn complex concepts."
                elif category == "exam":
                    fact = f"Target competitive milestone: {value.upper()} examination."
                elif category == "exam_date":
                    fact = f"Critical milestone alert: Target exam scheduled for {value}."
                elif category == "schedule_preference":
                    fact = f"Learning routine preference: Student studies best during the {value}."
                elif category == "weakness":
                    fact = f"Identified learning friction point: Student struggles with {value}."
                else:
                    fact = f"Preference noted: {category} -> {value}"

                facts.append({
                    "category": category,
                    "value": value,
                    "fact": fact
                })

        return facts
