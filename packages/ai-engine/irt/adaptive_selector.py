from typing import List, Dict, Any
import numpy as np
from .model import calculate_probability_3pl

def calculate_fisher_information(theta: float, a: float, b: float, c: float) -> float:
    """
    Computes the Fisher Information of a 3PL item at ability level theta.
    I(theta) = (1.7 * a)^2 * (1 - c) * P_star(theta)^2 / (P(theta) * (1 - P(theta)))
    """
    p = calculate_probability_3pl(theta, a, b, c)
    p = max(0.0001, min(0.9999, p)) # Avoid division by zero
    
    # P_star is the 2PL component: P_star = (P - c) / (1 - c)
    if c >= 1.0:
        return 0.0
    p_star = (p - c) / (1.0 - c)
    
    numerator = (1.7 * a) ** 2 * (1.0 - c) * (p_star ** 2) * ((1.0 - p_star) ** 2)
    denominator = p * (1.0 - p)
    
    return float(numerator / denominator)

def select_next_question(
    theta: float,
    questions: List[Dict[str, Any]],
    answered_ids: List[str]
) -> Dict[str, Any]:
    """
    Selects the next optimal question from the question bank matching the student's
    current ability (theta) by maximizing Fisher Information.
    
    Parameters:
        theta (float): Current estimated ability of the student.
        questions: List of dicts representing all questions in the bank.
        answered_ids: List of IDs of questions already answered by this student.
        
    Returns:
        Dict[str, Any]: The selected question dictionary.
    """
    # Filter out already answered questions
    candidates = [q for q in questions if str(q.get("id")) not in answered_ids]
    
    if not candidates:
        # Fallback if all questions are answered
        return None
        
    best_info = -1.0
    best_question = candidates[0]
    
    for q in candidates:
        a = float(q.get("discriminationA", 1.0))
        b = float(q.get("difficultyB", 0.0))
        c = float(q.get("guessingC", 0.0))
        
        info = calculate_fisher_information(theta, a, b, c)
        
        if info > best_info:
            best_info = info
            best_question = q
            
    return best_question
