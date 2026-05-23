from typing import Dict, Any, List

def engineer_student_features(
    quiz_attempts: List[Dict[str, Any]],
    sessions: List[Dict[str, Any]],
    nova_messages: List[Dict[str, Any]],
    current_theta: float,
    streak_days: int
) -> Dict[str, float]:
    """
    Compiles raw database telemetries (quiz runs, chat messages, sessions)
    into a standardized feature vector dictionary for the XGBoost Predictor.
    """
    # 1. Quiz engagement rate
    # Expected e.g. 5 quizzes assigned, if student attempted 4, rate = 0.8
    # Default fallback: if no attempts, engagement = 0.1, otherwise map to range
    attempts_count = len(quiz_attempts)
    quiz_engagement = min(1.0, max(0.1, attempts_count / 10.0))
    
    # 2. Average score slope (linear regression slope of quiz scores over time)
    # Correctness rates of last quizzes: e.g. 0.8, 0.7, 0.9 -> slope
    scores = []
    for attempt in quiz_attempts:
        correct_count = sum(1 for h in attempt.get("history", []) if h.get("correct"))
        total_questions = len(attempt.get("history", [1]))
        scores.append(correct_count / max(1, total_questions))
        
    slope = 0.0
    if len(scores) >= 2:
        # Simple slope calculation (last - first / time)
        y = scores[-5:] # last 5 scores
        x = list(range(len(y)))
        # Fit simple linear slope
        try:
            x_mean = sum(x) / len(x)
            y_mean = sum(y) / len(y)
            num = sum((xi - x_mean) * (yi - y_mean) for xi, yi in zip(x, y))
            den = sum((xi - x_mean) ** 2 for xi in x)
            slope = num / den if den != 0 else 0.0
        except Exception:
            slope = 0.0
            
    # 3. Average response time
    # Average seconds elapsed per question
    times = []
    for attempt in quiz_attempts:
        for q in attempt.get("history", []):
            t = q.get("timeElapsedSeconds", q.get("time_taken", 45))
            times.append(t)
    avg_response_time = sum(times) / len(times) if times else 45.0
    
    # 4. Weekly study session frequency
    # Number of sessions in past week
    # Mocking standard average sessions
    study_frequency = float(min(7.0, max(0.5, len(sessions) * 1.5)))
    
    # 5. Nova interaction count
    nova_count = float(len(nova_messages))
    
    return {
        "quiz_engagement_rate": float(quiz_engagement),
        "average_score_slope": float(slope),
        "average_response_time": float(avg_response_time),
        "study_session_frequency": float(study_frequency),
        "nova_interaction_count": float(nova_count),
        "streak_days": float(streak_days),
        "theta_ability_score": float(current_theta)
    }
