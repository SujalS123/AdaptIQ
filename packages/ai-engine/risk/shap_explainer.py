from typing import Dict, Any, List

class ShapExplainer:
    def __init__(self):
        self.feature_friendly_names = {
            "quiz_engagement_rate": "Quiz Engagement Rate",
            "average_score_slope": "Performance Trend (Score Slope)",
            "average_response_time": "Average Response Speed",
            "study_session_frequency": "Weekly Study Session Frequency",
            "nova_interaction_count": "AI Mentor (Nova) Interactions",
            "streak_days": "Daily Learning Streak",
            "theta_ability_score": "Cognitive Mastery (IRT Theta)"
        }

    def generate_explanations(self, contributions: Dict[str, float]) -> List[str]:
        """
        Translates raw SHAP/contribution values into high-premium, user-friendly natural explanations.
        Positive contribution means the feature increased dropout risk.
        Negative contribution means the feature decreased/mitigated dropout risk.
        """
        explanations = []
        
        # Sort contributions by absolute impact
        sorted_contribs = sorted(
            contributions.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        
        for name, value in sorted_contribs:
            friendly_name = self.feature_friendly_names.get(name, name)
            
            # Substantial impacts
            if abs(value) < 0.05:
                continue
                
            if value > 0:
                # This increases risk
                if name == "quiz_engagement_rate":
                    explanations.append(f"🔴 Low quiz engagement is strongly raising the student's risk profile.")
                elif name == "average_score_slope":
                    explanations.append(f"🔴 A declining score slope indicates potential frustration or concepts backlog.")
                elif name == "average_response_time":
                    explanations.append(f"🔴 Unusually high or low response times suggest cognitive strain or rush guessing.")
                elif name == "study_session_frequency":
                    explanations.append(f"🔴 Infrequent study logins are contributing to overall learning friction.")
                elif name == "theta_ability_score":
                    explanations.append(f"🔴 A decrease in measured subject matter proficiency increases dropout probability.")
                elif name == "streak_days":
                    explanations.append(f"🔴 A broken daily study streak has reduced active motivation momentum.")
                else:
                    explanations.append(f"🔴 {friendly_name} is negatively impacting learning consistency.")
            else:
                # This decreases/mitigates risk (protective factors)
                if name == "quiz_engagement_rate":
                    explanations.append(f"🟢 High active participation in quizzes is keeping the student anchored.")
                elif name == "average_score_slope":
                    explanations.append(f"🟢 Steady positive performance gains are mitigating overall dropout risks.")
                elif name == "study_session_frequency":
                    explanations.append(f"🟢 Regular weekly study sessions provide a strong protective routine.")
                elif name == "nova_interaction_count":
                    explanations.append(f"🟢 Proactive Q&A sessions with AI Mentor Nova indicate high learning curiousity.")
                elif name == "streak_days":
                    explanations.append(f"🟢 An outstanding consecutive study streak provides solid learning momentum.")
                elif name == "theta_ability_score":
                    explanations.append(f"🟢 Strong cognitive mastery (+{abs(value):.2f} θ) makes the student highly resilient.")
                
        # Limit to top 4 explanations for premium UI readability
        return explanations[:4]
