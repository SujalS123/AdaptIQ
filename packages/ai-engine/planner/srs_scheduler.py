from typing import Dict, Any, Tuple

def calculate_sm2_interval(
    quality: int,
    prev_interval: int,
    prev_repetitions: int,
    prev_efactor: float
) -> Tuple[int, int, float]:
    """
    Computes the next spaced repetition interval using the high-fidelity SuperMemo-2 (SM-2) algorithm.
    
    Parameters:
        quality (int): User response rating [0, 5]:
                       5: perfect response
                       4: correct response after a hesitation
                       3: correct response recalled with serious difficulty
                       2: incorrect response; where the correct one seemed easy to recall
                       1: incorrect response; the correct one remembered
                       0: complete blackout
        prev_interval (int): Previous interval in days.
        prev_repetitions (int): Number of consecutive successful repetitions.
        prev_efactor (float): Previous easiness factor (E-factor), defaults to 2.5.
        
    Returns:
        Tuple[int, int, float]: (next_interval_days, next_repetitions, new_efactor)
    """
    # Clamp quality
    q = max(0, min(5, quality))
    
    # 1. Update repetitions and interval
    if q >= 3:
        if prev_repetitions == 0:
            next_interval = 1
        elif prev_repetitions == 1:
            next_interval = 6
        else:
            next_interval = int(round(prev_interval * prev_efactor))
        next_repetitions = prev_repetitions + 1
    else:
        next_repetitions = 0
        next_interval = 1

    # 2. Update E-Factor
    # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_efactor = prev_efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_efactor = max(1.3, min(3.0, new_efactor)) # EF cannot go below 1.3
    
    return next_interval, next_repetitions, float(new_efactor)
