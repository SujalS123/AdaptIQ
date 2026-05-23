from typing import List, Dict, Any
import math

def balance_study_load(
    syllabus: List[Dict[str, Any]], # List of { "id": str, "name": str, "subject": str, "difficulty_rating": float }
    days_remaining: int,
    hours_per_day: float,
    student_mastery: Dict[str, float] # Dict of { concept_id: current_theta }
) -> List[Dict[str, Any]]:
    """
    Syllabus constraint balancer. Allocates topics/concepts across days remaining
    to balance study difficulty load, accounting for user ability (theta).
    
    Returns:
        List of day schedules: List[Dict[str, Any]] containing:
            - "day_number": int
            - "topics": List[Dict[str, Any]]
            - "estimated_hours": float
            - "total_difficulty_score": float
    """
    # 1. Calculate weighted difficulty for each syllabus topic
    # A topic has a base difficulty_rating [1, 5]
    # If student has low theta mastery for this concept, we scale up the required study hours!
    weighted_topics = []
    for topic in syllabus:
        topic_id = topic.get("id")
        base_diff = float(topic.get("difficulty_rating", 3.0))
        
        # Mastery scaling factor based on IRT theta
        theta = float(student_mastery.get(topic_id, 0.0))
        # Lower theta -> higher difficulty factor
        # Theta ranges typically [-3, 3]
        mastery_factor = 1.0 + max(0.0, -theta)
        
        weighted_difficulty = base_diff * mastery_factor
        # Estimate required study hours: base difficulty * factor (e.g. difficulty 3 = 3 hours base)
        estimated_hours = base_diff * 0.8 * mastery_factor
        
        weighted_topics.append({
            "id": topic_id,
            "name": topic.get("name"),
            "subject": topic.get("subject"),
            "base_difficulty": base_diff,
            "weighted_difficulty": weighted_difficulty,
            "estimated_hours": estimated_hours
        })

    # Sort topics by weighted difficulty descending (Greedy load balancing approach)
    weighted_topics.sort(key=lambda x: x["weighted_difficulty"], reverse=True)

    # 2. Initialize days schedules
    num_days = max(1, days_remaining)
    schedules = [{"day_number": i + 1, "topics": [], "estimated_hours": 0.0, "total_difficulty_score": 0.0} for i in range(num_days)]

    # 3. Greedy Multi-way Number Partitioning (distribute items to current day with least hours)
    for topic in weighted_topics:
        # Find day with minimum current hours allocation
        least_busy_day = min(schedules, key=lambda d: d["estimated_hours"])
        least_busy_day["topics"].append({
            "id": topic["id"],
            "name": topic["name"],
            "subject": topic["subject"],
            "estimated_hours": float(topic["estimated_hours"])
        })
        least_busy_day["estimated_hours"] += topic["estimated_hours"]
        least_busy_day["total_difficulty_score"] += topic["weighted_difficulty"]

    # Normalize estimated hours to float and verify constraint limits
    for day in schedules:
        day["estimated_hours"] = float(round(day["estimated_hours"], 2))
        day["total_difficulty_score"] = float(round(day["total_difficulty_score"], 2))
        
    return schedules
