"""
DNA Updater — Background Worker
================================
Async entry-points called by the FastAPI event system (or a task queue)
whenever a study session ends or a quiz is submitted.  Each handler
delegates to :class:`LearnerDNAService` and returns the updated profile
slice so that the caller can forward it to the front-end or persist it
to the database.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from .dna_service import LearnerDNAService

logger = logging.getLogger(__name__)


class DNAUpdater:
    """Background service that recalculates Learner DNA from accumulated
    signals."""

    def __init__(self, service: Optional[LearnerDNAService] = None):
        """
        Parameters
        ----------
        service : LearnerDNAService | None
            An existing service instance to reuse.  A new one is created
            if not supplied.
        """
        self.service = service or LearnerDNAService()

    # ── Session lifecycle ─────────────────────────────────────────────

    async def process_session_end(
        self,
        student_id: str,
        session_data: dict,
    ) -> dict:
        """Called when a study session ends.

        Parameters
        ----------
        student_id : str
            Learner identifier.
        session_data : dict
            Session record with at least:
            - ``"start_hour"`` (int, 0-23)
            - ``"duration_minutes"`` (float)

            Optional fields consumed by sub-modules:
            - ``"productivity_score"`` (float, 0-1)
            - ``"accuracy_first_half"`` / ``"accuracy_second_half"``
              (floats, 0-1)
            - ``"interaction_signals"`` (dict[str, float]) — VARK
              behavioural metrics recorded during the session.
            - ``"concepts_practiced"`` (list[str]) — concept IDs
              touched during the session (used for knowledge-graph
              refresh).

        Returns
        -------
        dict
            Updated attention + VARK slice of the Learner DNA.
        """
        logger.info(
            "Processing session end for student=%s  duration=%.1f min",
            student_id,
            session_data.get("duration_minutes", 0),
        )

        interaction_signals: Dict[str, float] = session_data.get(
            "interaction_signals", {}
        )

        # Delegate to the DNA service
        result = self.service.update_after_session(
            student_id=student_id,
            session_data=session_data,
            interaction_signals=interaction_signals,
        )

        # If concepts were practiced, refresh the mastery snapshot
        concepts: List[str] = session_data.get("concepts_practiced", [])
        if concepts:
            mastery_snapshot = {
                cid: self.service.mastery.get_mastery(student_id, cid)
                for cid in concepts
            }
            result["mastery_snapshot"] = mastery_snapshot

        logger.info("Session-end DNA update complete for student=%s", student_id)
        return result

    # ── Quiz lifecycle ────────────────────────────────────────────────

    async def process_quiz_submission(
        self,
        student_id: str,
        quiz_data: dict,
    ) -> dict:
        """Called after a quiz is submitted.

        Parameters
        ----------
        student_id : str
            Learner identifier.
        quiz_data : dict
            Must contain:
            - ``"responses"`` (list[dict]): each with ``"concept_id"``
              (str), ``"is_correct"`` (bool), ``"difficulty"`` (float,
              0-1).

            Optional:
            - ``"quiz_id"`` (str)
            - ``"subject"`` (str)

        Returns
        -------
        dict
            Summary containing per-concept mastery deltas and refreshed
            knowledge graph.
        """
        responses: List[dict] = quiz_data.get("responses", [])
        quiz_id: str = quiz_data.get("quiz_id", "unknown")

        logger.info(
            "Processing quiz submission for student=%s  quiz=%s  items=%d",
            student_id,
            quiz_id,
            len(responses),
        )

        if not responses:
            logger.warning("Empty responses list for quiz %s", quiz_id)
            return {
                "student_id": student_id,
                "quiz_id": quiz_id,
                "mastery_updates": [],
                "knowledge_graph": self.service.mastery.get_knowledge_graph(
                    student_id
                ),
            }

        # Delegate to the DNA service
        update_result = self.service.update_after_quiz(
            student_id=student_id,
            responses=responses,
        )
        update_result["quiz_id"] = quiz_id

        # Compute aggregate stats
        total = len(responses)
        correct = sum(1 for r in responses if r.get("is_correct"))
        update_result["summary"] = {
            "total_items": total,
            "correct": correct,
            "accuracy": round(correct / total, 4) if total else 0.0,
        }

        logger.info(
            "Quiz DNA update complete for student=%s  accuracy=%.2f",
            student_id,
            update_result["summary"]["accuracy"],
        )
        return update_result

    # ── Full profile rebuild ──────────────────────────────────────────

    async def rebuild_full_profile(
        self,
        student_id: str,
        quiz_responses: Optional[List[dict]] = None,
        interaction_signals: Optional[Dict[str, float]] = None,
        session_history: Optional[List[dict]] = None,
        session_durations: Optional[List[float]] = None,
    ) -> dict:
        """Perform a complete Learner DNA rebuild from all available data.

        This is typically called on a schedule (e.g. nightly) or when the
        student explicitly requests a profile refresh.

        Returns the full profile dict.
        """
        logger.info("Rebuilding full DNA profile for student=%s", student_id)

        profile = self.service.build_full_profile(
            student_id=student_id,
            quiz_responses=quiz_responses,
            interaction_signals=interaction_signals,
            session_history=session_history,
            session_durations=session_durations,
        )

        logger.info("Full DNA profile rebuild complete for student=%s", student_id)
        return profile
