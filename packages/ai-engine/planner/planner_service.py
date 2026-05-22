from typing import List, Dict, Any
from .study_planner import balance_study_load
from .srs_scheduler import calculate_sm2_interval
from .constraint_solver import KnapsackStudyOptimizer

class PlannerService:
    def __init__(self):
        self.optimizer = KnapsackStudyOptimizer()

    def generate_balanced_plan(
        self,
        syllabus: List[Dict[str, Any]],
        days_remaining: int,
        hours_per_day: float,
        student_mastery: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        return balance_study_load(syllabus, days_remaining, hours_per_day, student_mastery)

    def calculate_next_review(
        self,
        quality: int,
        prev_interval: int,
        prev_repetitions: int,
        prev_efactor: float
    ) -> Dict[str, Any]:
        interval, repetitions, efactor = calculate_sm2_interval(
            quality, prev_interval, prev_repetitions, prev_efactor
        )
        return {
            "next_interval_days": interval,
            "next_repetitions": repetitions,
            "new_efactor": efactor
        }
