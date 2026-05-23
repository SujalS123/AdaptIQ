from typing import Dict, Any, List
from .xgboost_predictor import DropoutRiskPredictor
from .shap_explainer import ShapExplainer
from .feature_engineer import engineer_student_features
from .alert_publisher import AlertPublisher

class RiskService:
    def __init__(self, kafka_brokers: List[str] = None):
        self.predictor = DropoutRiskPredictor()
        self.explainer = ShapExplainer()
        self.publisher = AlertPublisher(kafka_brokers)

    def analyze_student_risk(
        self,
        student_id: str,
        student_name: str,
        quiz_attempts: List[Dict[str, Any]],
        sessions: List[Dict[str, Any]],
        nova_messages: List[Dict[str, Any]],
        current_theta: float,
        streak_days: int
    ) -> Dict[str, Any]:
        """
        Runs the full dropout risk analysis pipeline:
        1. Feature Engineering
        2. XGBoost Inference
        3. SHAP Explanation Generation
        4. Conditional Alert Publishing (Kafka)
        """
        # 1. Feature Engineering
        features = engineer_student_features(
            quiz_attempts,
            sessions,
            nova_messages,
            current_theta,
            streak_days
        )

        # 2. Prediction
        risk_probability, contributions = self.predictor.predict_risk(features)

        # 3. Explanations
        explanations = self.explainer.generate_explanations(contributions)

        # Classify risk level
        if risk_probability > 0.7:
            risk_level = "high"
        elif risk_probability > 0.4:
            risk_level = "medium"
        else:
            risk_level = "low"

        result = {
            "student_id": student_id,
            "student_name": student_name,
            "risk_score": float(risk_probability),
            "risk_level": risk_level,
            "features": features,
            "explanations": explanations
        }

        # 4. Conditional Alert Publishing
        if risk_level == "high":
            alert_payload = {
                "alert_type": "high_dropout_risk",
                "student_id": student_id,
                "student_name": student_name,
                "risk_score": float(risk_probability),
                "primary_driver": explanations[0] if explanations else "Unknown behavioral shift.",
                "message": f"CRITICAL: {student_name} has a high dropout/burnout risk of {risk_probability * 100:.1f}%. Action required."
            }
            self.publisher.publish_alert("student-risk-alerts", alert_payload)

        return result
