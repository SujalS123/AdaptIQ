"""
Bayesian Mastery Calculator (AI-002)
====================================
Maintains per-concept mastery scores updated via Bayesian posterior
updates following the BKT (Bayesian Knowledge Tracing) response model:

    P(correct | mastery) = (1 − slip) × mastery + guess × (1 − mastery)

After each observed response the mastery posterior is computed in closed
form, avoiding expensive MCMC or quadrature.

The module also tracks a lightweight in-memory knowledge graph where
nodes represent concepts and edges capture prerequisite relationships.
"""

from __future__ import annotations

import math
from typing import Dict, List, Optional, Tuple


class MasteryCalculator:
    """Per-concept Bayesian mastery tracker with knowledge-graph support."""

    def __init__(
        self,
        prior_mastery: float = 0.3,
        slip: float = 0.1,
        guess: float = 0.25,
        transit: float = 0.1,
    ):
        """
        Parameters
        ----------
        prior_mastery : float
            Default prior probability that the student has mastered an
            unseen concept.
        slip : float
            P(incorrect | mastered).  Probability that a student who
            *has* mastered the concept still answers incorrectly.
        guess : float
            P(correct | ¬mastered).  Probability that a student who has
            *not* mastered the concept guesses correctly.
        transit : float
            Probability that mastery is acquired on each practice
            opportunity (learning transition).
        """
        self.prior_mastery = prior_mastery
        self.slip = slip
        self.guess = guess
        self.transit = transit

        # In-memory stores (keyed by student_id)
        # student_id → {concept_id → mastery_float}
        self._mastery_store: Dict[str, Dict[str, float]] = {}

        # Concept dependency graph: concept_id → list of prerequisite concept_ids
        self._prerequisites: Dict[str, List[str]] = {}

    # ── Bayesian update ───────────────────────────────────────────────

    def update_mastery(
        self,
        current_mastery: float,
        is_correct: bool,
        item_difficulty: float,
    ) -> float:
        """Bayesian update of concept mastery after a single quiz response.

        Uses the BKT observation model:

            P(correct | L) = (1 − slip) × L + guess × (1 − L)

        where *L* is the current mastery probability and *item_difficulty*
        is used to modulate the slip / guess parameters (harder items
        increase slip and decrease guess).

        Parameters
        ----------
        current_mastery : float
            Current P(mastered) in [0, 1].
        is_correct : bool
            Whether the student answered correctly.
        item_difficulty : float
            Item difficulty in a normalised [0, 1] range (0 = easiest,
            1 = hardest).

        Returns
        -------
        float
            Updated mastery probability in [0, 1].
        """
        # Clamp inputs
        L = max(0.001, min(0.999, current_mastery))
        d = max(0.0, min(1.0, item_difficulty))

        # Difficulty-adjusted slip and guess
        # Harder items → higher effective slip, lower effective guess
        eff_slip = min(0.5, self.slip + 0.15 * d)
        eff_guess = max(0.01, self.guess * (1.0 - 0.5 * d))

        # Observation likelihood
        p_correct_given_mastered = 1.0 - eff_slip
        p_correct_given_unmastered = eff_guess

        if is_correct:
            p_obs_given_mastered = p_correct_given_mastered
            p_obs_given_unmastered = p_correct_given_unmastered
        else:
            p_obs_given_mastered = eff_slip
            p_obs_given_unmastered = 1.0 - eff_guess

        # Bayes' rule: posterior P(L | observation)
        numerator = p_obs_given_mastered * L
        denominator = numerator + p_obs_given_unmastered * (1.0 - L)

        if denominator < 1e-12:
            posterior = L  # Avoid division by zero; keep prior
        else:
            posterior = numerator / denominator

        # Apply learning transition: even after an incorrect answer the
        # student may have "learned" from the experience.
        posterior = posterior + (1.0 - posterior) * self.transit

        return max(0.001, min(0.999, posterior))

    # ── Student mastery bookkeeping ───────────────────────────────────

    def get_mastery(self, student_id: str, concept_id: str) -> float:
        """Return current mastery for *concept_id*, initialising if needed."""
        return (
            self._mastery_store
            .get(student_id, {})
            .get(concept_id, self.prior_mastery)
        )

    def set_mastery(self, student_id: str, concept_id: str, value: float) -> None:
        """Persist an updated mastery value."""
        if student_id not in self._mastery_store:
            self._mastery_store[student_id] = {}
        self._mastery_store[student_id][concept_id] = max(0.001, min(0.999, value))

    def record_response(
        self,
        student_id: str,
        concept_id: str,
        is_correct: bool,
        item_difficulty: float,
    ) -> float:
        """High-level helper: fetch → update → store → return new mastery."""
        current = self.get_mastery(student_id, concept_id)
        updated = self.update_mastery(current, is_correct, item_difficulty)
        self.set_mastery(student_id, concept_id, updated)
        return updated

    # ── Knowledge graph ───────────────────────────────────────────────

    def add_prerequisite(self, concept_id: str, prerequisite_id: str) -> None:
        """Declare that *prerequisite_id* must be mastered before
        *concept_id*."""
        self._prerequisites.setdefault(concept_id, [])
        if prerequisite_id not in self._prerequisites[concept_id]:
            self._prerequisites[concept_id].append(prerequisite_id)

    def get_knowledge_graph(self, student_id: str) -> dict:
        """Return the full knowledge graph with per-concept mastery scores.

        Returns
        -------
        dict
            ``{
                "student_id": str,
                "nodes": [
                    {"concept_id": str, "mastery": float, "status": str},
                    ...
                ],
                "edges": [
                    {"from": prerequisite_id, "to": concept_id},
                    ...
                ],
                "overall_mastery": float
            }``

        ``status`` is one of ``"not_started"`` (mastery ≤ prior),
        ``"in_progress"`` (prior < mastery < 0.8), or ``"mastered"``
        (mastery ≥ 0.8).
        """
        concept_ids: set[str] = set()

        # Gather concepts from mastery store
        if student_id in self._mastery_store:
            concept_ids.update(self._mastery_store[student_id].keys())

        # Gather concepts from prerequisite graph
        for cid, prereqs in self._prerequisites.items():
            concept_ids.add(cid)
            concept_ids.update(prereqs)

        nodes: List[dict] = []
        mastery_sum = 0.0
        for cid in sorted(concept_ids):
            m = self.get_mastery(student_id, cid)
            mastery_sum += m
            if m <= self.prior_mastery:
                status = "not_started"
            elif m >= 0.8:
                status = "mastered"
            else:
                status = "in_progress"
            nodes.append({"concept_id": cid, "mastery": round(m, 4), "status": status})

        edges: List[dict] = []
        for cid, prereqs in self._prerequisites.items():
            for pid in prereqs:
                edges.append({"from": pid, "to": cid})

        overall = mastery_sum / len(nodes) if nodes else self.prior_mastery

        return {
            "student_id": student_id,
            "nodes": nodes,
            "edges": edges,
            "overall_mastery": round(overall, 4),
        }

    def get_weakest_concepts(
        self, student_id: str, n: int = 5
    ) -> List[Tuple[str, float]]:
        """Return the *n* concepts with the lowest mastery scores."""
        store = self._mastery_store.get(student_id, {})
        if not store:
            return []
        ranked = sorted(store.items(), key=lambda kv: kv[1])
        return ranked[:n]

    def get_ready_concepts(self, student_id: str) -> List[str]:
        """Return concepts whose prerequisites are all mastered (≥ 0.8)
        but which are themselves not yet mastered."""
        ready: List[str] = []
        for cid, prereqs in self._prerequisites.items():
            own_mastery = self.get_mastery(student_id, cid)
            if own_mastery >= 0.8:
                continue  # Already mastered
            all_prereqs_met = all(
                self.get_mastery(student_id, pid) >= 0.8 for pid in prereqs
            )
            if all_prereqs_met:
                ready.append(cid)
        return ready
