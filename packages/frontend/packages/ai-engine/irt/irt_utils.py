from typing import List, Dict, Any
from .mle_estimator import estimate_theta_eap, estimate_theta_mle
from .adaptive_selector import select_next_question

def process_irt_update(responses: List[Dict[str, Any]], method: str = "eap") -> float:
    """
    Utility wrapper to update dynamic theta based on a selected method (EAP or MLE).
    """
    if method.lower() == "mle":
        return estimate_theta_mle(responses)
    return estimate_theta_eap(responses)
