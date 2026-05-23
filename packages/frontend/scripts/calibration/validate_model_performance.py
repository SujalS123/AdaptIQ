import os
import sys

# Add packages/ai-engine to python path to allow direct imports of local modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../packages/ai-engine')))

from irt.model import calculate_probability_3pl
from irt.mle_estimator import estimate_theta_eap, estimate_theta_mle
from irt.adaptive_selector import select_next_question
from irt.question_bank import MOCK_QUESTIONS

def run_psychometric_simulation(true_theta: float, num_items: int = 4):
    print(f"[RUNNING] Running psychometric simulation with target student ability theta_true = {true_theta:.2f}")
    print("--------------------------------------------------------------------------------")
    
    current_est_theta = 0.0
    history = []
    answered_ids = []

    for i in range(num_items):
        # 1. Select optimal question
        q = select_next_question(current_est_theta, MOCK_QUESTIONS, answered_ids)
        if not q:
            print("[WARN] No more questions available in the bank.")
            break
            
        q_id = q["id"]
        answered_ids.append(q_id)
        
        a = q["discriminationA"]
        b = q["difficultyB"]
        c = q["guessingC"]
        
        # 2. Compute probability of correctness based on true ability
        p_correct = calculate_probability_3pl(true_theta, a, b, c)
        
        # Determine simulated response (simulate answer deterministically or probabilistically)
        # For validation, we use a deterministic rule: correct if true_theta >= difficultyB
        correct = true_theta >= b
        
        history.append({
            "question_id": q_id,
            "correct": correct,
            "a": a,
            "b": b,
            "c": c
        })
        
        # 3. Update ability estimate
        old_est = current_est_theta
        current_est_theta = estimate_theta_eap(history)
        
        print(f"Item {i+1}: ID={q_id} | Diff={b:+.2f} | Ans={'CORRECT' if correct else 'WRONG'} | Est.theta: {old_est:+.2f} -> {current_est_theta:+.2f}")

    print("--------------------------------------------------------------------------------")
    print(f"[FINISHED] Simulation complete! Final Estimated theta: {current_est_theta:+.2f} (Error: {abs(current_est_theta - true_theta):.2f})")
    
if __name__ == "__main__":
    # Test for an advanced student (theta = +1.5)
    run_psychometric_simulation(true_theta=1.5)
    print("\n")
    # Test for a struggling student (theta = -1.2)
    run_psychometric_simulation(true_theta=-1.2)
