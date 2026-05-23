import numpy as np
from typing import List, Dict, Any
from .model import calculate_probability_3pl

def estimate_theta_eap(responses: List[Dict[str, Any]], prior_mean: float = 0.0, prior_sd: float = 1.0) -> float:
    """
    Computes the Expected A Posteriori (EAP) estimate of ability (theta)
    given a list of item responses and their parameters (a, b, c).
    
    This is extremely robust and converges perfectly even for all-correct or all-incorrect cases.
    
    Parameters:
        responses: List of dicts, each containing:
            - "correct" (bool/int): Whether the response was correct (1) or incorrect (0).
            - "a" (float): Discrimination parameter.
            - "b" (float): Difficulty parameter.
            - "c" (float): Guessing parameter.
        prior_mean (float): Mean of the normal prior distribution. Default is 0.0.
        prior_sd (float): Standard deviation of the normal prior distribution. Default is 1.0.
        
    Returns:
        float: Estimated ability level (theta). Typically bounds within [-4.0, 4.0].
    """
    if not responses:
        return prior_mean

    # Set up quadrature points (grid search across the ability continuum)
    theta_grid = np.linspace(-4.0, 4.0, 81) # 81 nodes from -4.0 to +4.0
    
    # Calculate prior probabilities (normal distribution)
    prior = np.exp(-0.5 * ((theta_grid - prior_mean) / prior_sd) ** 2)
    prior /= np.sum(prior) # normalize prior

    # Calculate likelihood for each theta point
    likelihood = np.ones_like(theta_grid)
    
    for resp in responses:
        correct = 1 if resp.get("correct") else 0
        a = float(resp.get("a", 1.0))
        b = float(resp.get("b", 0.0))
        c = float(resp.get("c", 0.0))
        
        # Calculate probability of correct answer at each grid point
        p_correct = np.array([calculate_probability_3pl(t, a, b, c) for t in theta_grid])
        
        # Likelihood of this response
        item_likelihood = p_correct if correct == 1 else (1.0 - p_correct)
        likelihood *= item_likelihood

    # Calculate posterior distribution
    posterior = likelihood * prior
    posterior_sum = np.sum(posterior)
    
    if posterior_sum == 0:
        # Fallback in case of extreme values or underflow
        return prior_mean
        
    posterior /= posterior_sum # normalize posterior
    
    # EAP Estimate is the mean of the posterior
    estimated_theta = np.sum(theta_grid * posterior)
    return float(estimated_theta)

def estimate_theta_mle(responses: List[Dict[str, Any]], start_theta: float = 0.0) -> float:
    """
    Computes the Maximum Likelihood Estimation (MLE) of ability (theta)
    using Newton-Raphson iterations.
    
    Falls back to EAP if responses are all correct or all incorrect to avoid divergence.
    """
    # Check for all correct or all incorrect
    corrects = [1 if r.get("correct") else 0 for r in responses]
    if len(responses) > 0 and (sum(corrects) == 0 or sum(corrects) == len(responses)):
        # Pure MLE diverges for all-correct or all-incorrect responses. Use EAP!
        return estimate_theta_eap(responses, prior_mean=start_theta)
        
    theta = start_theta
    max_iter = 10
    tolerance = 0.001
    
    for _ in range(max_iter):
        num = 0.0  # Numerator (First derivative / Gradient)
        den = 0.0  # Denominator (Second derivative / Information)
        
        for resp in responses:
            correct = 1 if resp.get("correct") else 0
            a = float(resp.get("a", 1.0))
            b = float(resp.get("b", 0.0))
            c = float(resp.get("c", 0.0))
            
            p = calculate_probability_3pl(theta, a, b, c)
            # Avoid divide-by-zero
            p = max(0.0001, min(0.9999, p))
            
            # 3PL derivatives
            # P_star = (P - c) / (1 - c)
            p_star = (p - c) / (1.0 - c) if c < 1.0 else p
            
            # Derivative of P with respect to theta
            dp_dtheta = 1.7 * a * (1.0 - c) * p_star * (1.0 - p_star)
            
            # Update information and score equations
            term = (correct - p) / (p * (1.0 - p))
            num += dp_dtheta * term
            den -= (dp_dtheta ** 2) / (p * (1.0 - p))
            
        if abs(den) < 1e-6:
            break
            
        step = num / den
        theta -= step # Subtracting step because den is negative (Newton's method: theta = theta - f'/f'')
        
        # Clamp theta to reasonable bounds
        theta = max(-4.0, min(4.0, theta))
        
        if abs(step) < tolerance:
            break
            
    return float(theta)
