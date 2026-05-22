"""
Learner DNA Service
===================
Unified orchestration layer that combines:

* **VARKDetector** — learning-style profiling (AI-006, AI-007)
* **MasteryCalculator** — Bayesian concept-level mastery (AI-002)
* **AttentionWindowDetector** — engagement / attention analysis

Downstream consumers (FastAPI routes, background workers) should
interact with this service rather than instantiating sub-modules
directly.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from .attention_window_detector import AttentionWindowDetector
from .learning_style_detector import VARKDetector
from .mastery_calculator import MasteryCalculator


class LearnerDNAService:
    """Facade that builds and maintains complete Learner DNA profiles."""

    def __init__(
        self,
        prior_mastery: float = 0.3,
        slip: float = 0.1,
        guess: float = 0.25,
        transit: float = 0.1,
        quiz_weight: float = 0.4,
        interaction_weight: float = 0.6,
    ):
        self.vark = VARKDetector(
            quiz_weight=quiz_weight,
            interaction_weight=interaction_weight,
        )
        self.mastery = MasteryCalculator(
            prior_mastery=prior_mastery,
            slip=slip,
            guess=guess,
            transit=transit,
        )
        self.attention = AttentionWindowDetector()

        # In-memory cache of the latest full profile per student
        self._profile_cache: Dict[str, dict] = {}

    # ── Full profile ──────────────────────────────────────────────────

    def build_full_profile(
        self,
        student_id: str,
        quiz_responses: Optional[List[dict]] = None,
        interaction_signals: Optional[Dict[str, float]] = None,
        session_history: Optional[List[dict]] = None,
        session_durations: Optional[List[float]] = None,
    ) -> dict:
        """Build a complete Learner DNA profile.

        Parameters
        ----------
        student_id : str
            Unique learner identifier.
        quiz_responses : list[dict] | None
            Onboarding quiz answers (passed to VARKDetector).
        interaction_signals : dict[str, float] | None
            Behavioural signal metrics (passed to VARKDetector).
        session_history : list[dict] | None
            Historical session records (passed to AttentionWindowDetector).
        session_durations : list[float] | None
            Session lengths in minutes (passed to AttentionWindowDetector).

        Returns
        -------
        dict
            Complete DNA profile with learning style, mastery graph,
            attention patterns, and content recommendations.
        """
        # ── Learning style ────────────────────────────────────────────
        vark_profile = self.vark.get_combined_profile(
            quiz_responses=quiz_responses or [],
            interaction_signals=interaction_signals or {},
        )

        # ── Mastery knowledge graph ───────────────────────────────────
        knowledge_graph = self.mastery.get_knowledge_graph(student_id)
        weakest = self.mastery.get_weakest_concepts(student_id, n=5)
        ready = self.mastery.get_ready_concepts(student_id)

        # ── Attention patterns ────────────────────────────────────────
        peak_hours = self.attention.detect_peak_hours(session_history or [])
        attention_span = self.attention.detect_attention_span(
            session_durations or []
        )

        profile: dict = {
            "student_id": student_id,
            "learning_style": vark_profile,
            "mastery": {
                "knowledge_graph": knowledge_graph,
                "weakest_concepts": [
                    {"concept_id": cid, "mastery": round(m, 4)}
                    for cid, m in weakest
                ],
                "ready_to_learn": ready,
            },
            "attention": {
                "peak_hours": peak_hours,
                "attention_span": attention_span,
            },
            "recommendations": vark_profile.get("recommendations", {}),
        }

        self._profile_cache[student_id] = profile
        return profile

    # ── Quiz-driven updates ───────────────────────────────────────────

    def update_after_quiz(
        self,
        student_id: str,
        responses: List[dict],
    ) -> dict:
        """Update the Learner DNA after a quiz submission.

        Each element in *responses* should carry:
        - ``"concept_id"`` (str)
        - ``"is_correct"`` (bool)
        - ``"difficulty"`` (float, 0-1)

        Optionally:
        - ``"selected_style"`` (str) — VARK tag if the question has one.

        Returns
        -------
        dict
            Summary of mastery updates applied.
        """
        updates: List[dict] = []
        vark_responses: List[dict] = []

        for resp in responses:
            concept_id: str = resp.get("concept_id", "unknown")
            is_correct: bool = bool(resp.get("is_correct", False))
            difficulty: float = float(resp.get("difficulty", 0.5))

            new_mastery = self.mastery.record_response(
                student_id=student_id,
                concept_id=concept_id,
                is_correct=is_correct,
                item_difficulty=difficulty,
            )
            updates.append(
                {
                    "concept_id": concept_id,
                    "is_correct": is_correct,
                    "new_mastery": round(new_mastery, 4),
                }
            )

            # Collect VARK tags if present
            if "selected_style" in resp:
                vark_responses.append(resp)

        # Refresh VARK if new style data was gathered
        vark_update: Optional[dict] = None
        if vark_responses:
            vark_update = self.vark.classify_from_onboarding(vark_responses)

        # Refresh knowledge graph
        knowledge_graph = self.mastery.get_knowledge_graph(student_id)

        return {
            "student_id": student_id,
            "mastery_updates": updates,
            "vark_update": vark_update,
            "knowledge_graph": knowledge_graph,
        }

    # ── Session-driven updates ────────────────────────────────────────

    def update_after_session(
        self,
        student_id: str,
        session_data: dict,
        interaction_signals: Optional[Dict[str, float]] = None,
    ) -> dict:
        """Update attention and VARK signals after a study session.

        Parameters
        ----------
        session_data : dict
            Must include ``"start_hour"``, ``"duration_minutes"``.
            Optionally ``"productivity_score"``, ``"accuracy_first_half"``,
            ``"accuracy_second_half"``.
        interaction_signals : dict[str, float] | None
            Behavioural metrics collected during the session.

        Returns
        -------
        dict
            Updated attention metrics and optional VARK refresh.
        """
        # Attention analysis (wrap session_data in a list for the detector)
        peak_hours = self.attention.detect_peak_hours([session_data])
        duration = float(session_data.get("duration_minutes", 0))
        span_info = self.attention.detect_attention_span([duration] if duration > 0 else [])
        fatigue = self.attention.compute_fatigue_index(session_data)

        # VARK refresh from interaction signals
        vark_update: Optional[dict] = None
        if interaction_signals:
            vark_update = self.vark.classify_from_interactions(interaction_signals)

        return {
            "student_id": student_id,
            "attention": {
                "peak_hours": peak_hours,
                "attention_span": span_info,
                "fatigue_index": fatigue,
            },
            "vark_interaction_update": vark_update,
        }

    # ── Cached profile retrieval ──────────────────────────────────────

    def get_cached_profile(self, student_id: str) -> Optional[dict]:
        """Return the most recently built profile, or ``None``."""
        return self._profile_cache.get(student_id)
