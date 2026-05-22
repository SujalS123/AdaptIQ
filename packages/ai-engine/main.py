from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

# Import local engines
from irt.mle_estimator import estimate_theta_eap, estimate_theta_mle
from irt.adaptive_selector import select_next_question
from irt.question_bank import MOCK_QUESTIONS
from risk.risk_service import RiskService
from planner.planner_service import PlannerService
from nova.agent_orchestrator import NovaAgentOrchestrator
from dna.learning_style_detector import VARKDetector

app = FastAPI(
    title="AdaptIQ AI-Engine",
    description="FastAPI Microservice powering psychometric IRT updates, RAG prompts, spaced repetitions, and XGBoost drop-out risks.",
    version="1.0.0"
)

# Enable CORS for communication with node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services instantiations
risk_service = RiskService()
planner_service = PlannerService()
nova_orchestrator = NovaAgentOrchestrator()
vark_detector = VARKDetector()

# --- Pydantic Schemas ---

class VARKRequest(BaseModel):
    quiz_responses: List[Dict[str, Any]]
    interaction_signals: Dict[str, float]

class IRTResponseItem(BaseModel):
    question_id: str
    correct: bool
    a: float
    b: float
    c: float

class IRTRequest(BaseModel):
    student_id: str
    responses: List[IRTResponseItem]
    method: Optional[str] = "eap"

class AdaptiveSelectRequest(BaseModel):
    theta: float
    answered_ids: List[str]

class RiskAnalyzeRequest(BaseModel):
    student_id: str
    student_name: str
    quiz_attempts: List[Dict[str, Any]]
    sessions: List[Dict[str, Any]]
    nova_messages: List[Dict[str, Any]]
    current_theta: float
    streak_days: int

class StudyPlanRequest(BaseModel):
    syllabus: List[Dict[str, Any]]
    days_remaining: int
    hours_per_day: float
    student_mastery: Dict[str, float]

class SRSRequest(BaseModel):
    quality: int
    prev_interval: int
    prev_repetitions: int
    prev_efactor: float

class NovaChatRequest(BaseModel):
    student_id: str
    text: str
    current_theta: float
    recent_errors: Optional[List[str]] = None
    selected_language: Optional[str] = None


# --- Endpoints ---

@app.get("/health")
def health():
    return {"status": "healthy", "engine": "AdaptIQ AI-Engine"}

@app.post("/irt/mle")
def calculate_irt_theta(payload: IRTRequest):
    """
    Computes high-precision latent trait ability (theta) using EAP or MLE.
    """
    try:
        # Convert Pydantic items to dictionaries
        items = []
        for r in payload.responses:
            items.append({
                "correct": r.correct,
                "a": r.a,
                "b": r.b,
                "c": r.c
            })
            
        if payload.method.lower() == "mle":
            theta = estimate_theta_mle(items)
        else:
            theta = estimate_theta_eap(items)
            
        return {"theta": float(theta)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/irt/adaptive")
def get_adaptive_question(payload: AdaptiveSelectRequest):
    """
    Queries Fisher information to select the next optimal question from the question bank.
    """
    try:
        selected = select_next_question(payload.theta, MOCK_QUESTIONS, payload.answered_ids)
        if not selected:
            return {"status": "completed", "message": "All questions answered successfully!"}
        return {"status": "active", "question": selected}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/risk/analyze")
def analyze_student_risk(payload: RiskAnalyzeRequest):
    """
    Runs feature engineering and XGBoost classifier with SHAP descriptions.
    """
    try:
        result = risk_service.analyze_student_risk(
            student_id=payload.student_id,
            student_name=payload.student_name,
            quiz_attempts=payload.quiz_attempts,
            sessions=payload.sessions,
            nova_messages=payload.nova_messages,
            current_theta=payload.current_theta,
            streak_days=payload.streak_days
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/planner/balanced")
def balance_study_syllabus(payload: StudyPlanRequest):
    """
    Greedy load balancer dividing subjects across available calendar days.
    """
    try:
        plan = planner_service.generate_balanced_plan(
            syllabus=payload.syllabus,
            days_remaining=payload.days_remaining,
            hours_per_day=payload.hours_per_day,
            student_mastery=payload.student_mastery
        )
        return {"schedule": plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/planner/srs")
def calculate_spaced_repetition(payload: SRSRequest):
    """
    Computes SuperMemo SM-2 intervals.
    """
    try:
        result = planner_service.calculate_next_review(
            quality=payload.quality,
            prev_interval=payload.prev_interval,
            prev_repetitions=payload.prev_repetitions,
            prev_efactor=payload.prev_efactor
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/nova/chat")
def get_nova_socratic_chat(payload: NovaChatRequest):
    """
    Runs RAG Rerank and cognitive Socratic pipeline for Nova Chatbot.
    """
    try:
        result = nova_orchestrator.process_query(
            student_id=payload.student_id,
            text=payload.text,
            current_theta=payload.current_theta,
            recent_errors=payload.recent_errors,
            selected_language=payload.selected_language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/dna/vark")
def detect_vark_style(payload: VARKRequest):
    """
    Classifies student learning modality (VARK style) based on quiz answers and implicit metrics.
    """
    try:
        profile = vark_detector.get_combined_profile(
            quiz_responses=payload.quiz_responses,
            interaction_signals=payload.interaction_signals
        )
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
