import numpy as np

def calculate_probability_3pl(theta: float, a: float, b: float, c: float) -> float:
    """
    Computes the probability of a correct response under the 3-Parameter Logistic (3PL) model.
    P(theta) = c + (1 - c) / (1 + exp(-1.7 * a * (theta - b)))
    
    Parameters:
        theta (float): The dynamic latent trait / ability level of the learner.
        a (float): The item discrimination parameter (how well the question distinguishes ability levels).
        b (float): The item difficulty parameter (the ability level where P(theta) is halfway between c and 1).
        c (float): The item guessing parameter (lower asymptote, probability of correct response by guessing).
        
    Returns:
        float: The probability [0.0, 1.0] of a correct response.
    """
    try:
        exponent = -1.7 * a * (theta - b)
        # Avoid overflow in exp
        exponent = np.clip(exponent, -500, 500)
        p = c + (1.0 - c) / (1.0 + np.exp(exponent))
        return float(p)
    except Exception as e:
        # Fallback to standard math-based calculation in case of exception
        import math
        try:
            exponent = -1.7 * a * (theta - b)
            exponent = max(-500.0, min(500.0, exponent))
            return c + (1.0 - c) / (1.0 + math.exp(exponent))
        except Exception:
            return 0.5
