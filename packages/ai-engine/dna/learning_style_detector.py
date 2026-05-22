"""
VARK Learning Style Detector (AI-006, AI-007)
==============================================
Classifies students into Visual, Auditory, Reading/Writing, Kinesthetic
based on interaction patterns and onboarding quiz responses.

Scoring pipeline
~~~~~~~~~~~~~~~~
1. **Onboarding quiz** — Each question maps to one or more VARK categories.
   Raw counts are normalised to [0, 1] per style.
2. **Implicit interaction signals** — Continuous behavioural metrics (e.g.
   video completion rate, exercise attempt rate) are projected through a
   learned weight matrix and normalised.
3. **Combined profile** — A configurable blend (default 40 % quiz / 60 %
   interactions) produces the final VARK vector, from which primary /
   secondary styles and content-format recommendations are derived.
"""

from __future__ import annotations

import math
from typing import Dict, List, Optional, Tuple


class VARKDetector:
    """
    Detects primary and secondary VARK learning styles from:
    1. Onboarding quiz response patterns
    2. Implicit interaction signals (video completion, text engagement,
       diagram clicks, exercise attempts)
    """

    STYLES: List[str] = ["visual", "auditory", "reading_writing", "kinesthetic"]

    # ── Content-format mapping per dominant style ──────────────────────
    _FORMAT_MAP: Dict[str, dict] = {
        "visual": {
            "primary_format": "video",
            "secondary_format": "diagram",
            "enable_tts": False,
            "prefer_infographics": True,
            "prefer_interactive_sim": False,
        },
        "auditory": {
            "primary_format": "audio_lecture",
            "secondary_format": "podcast",
            "enable_tts": True,
            "prefer_infographics": False,
            "prefer_interactive_sim": False,
        },
        "reading_writing": {
            "primary_format": "text_article",
            "secondary_format": "notes",
            "enable_tts": False,
            "prefer_infographics": False,
            "prefer_interactive_sim": False,
        },
        "kinesthetic": {
            "primary_format": "interactive_exercise",
            "secondary_format": "simulation",
            "enable_tts": False,
            "prefer_infographics": False,
            "prefer_interactive_sim": True,
        },
    }

    def __init__(self, quiz_weight: float = 0.4, interaction_weight: float = 0.6):
        """
        Parameters
        ----------
        quiz_weight : float
            Weight applied to the onboarding-quiz VARK vector when blending.
        interaction_weight : float
            Weight applied to the interaction-signal VARK vector when blending.
        """
        self.quiz_weight = quiz_weight
        self.interaction_weight = interaction_weight

        # Projection matrix: signal → VARK contribution weights.
        # Each key is a signal name; values map to how strongly that signal
        # indicates each VARK style.
        self.signal_weights: Dict[str, Dict[str, float]] = {
            "video_completion_rate": {
                "visual": 0.7,
                "auditory": 0.8,
                "reading_writing": 0.2,
                "kinesthetic": 0.3,
            },
            "text_reading_time": {
                "visual": 0.2,
                "auditory": 0.1,
                "reading_writing": 0.9,
                "kinesthetic": 0.2,
            },
            "diagram_interaction_rate": {
                "visual": 0.9,
                "auditory": 0.1,
                "reading_writing": 0.3,
                "kinesthetic": 0.4,
            },
            "exercise_attempt_rate": {
                "visual": 0.3,
                "auditory": 0.2,
                "reading_writing": 0.3,
                "kinesthetic": 0.9,
            },
            "audio_replay_count": {
                "visual": 0.1,
                "auditory": 0.9,
                "reading_writing": 0.2,
                "kinesthetic": 0.1,
            },
            "note_taking_frequency": {
                "visual": 0.3,
                "auditory": 0.2,
                "reading_writing": 0.8,
                "kinesthetic": 0.3,
            },
        }

    # ── helpers ────────────────────────────────────────────────────────

    @staticmethod
    def _normalise(scores: Dict[str, float]) -> Dict[str, float]:
        """Min-max normalise *scores* so all values lie in [0, 1].

        If all values are identical (or zero), returns uniform 0.25 per style.
        """
        vals = list(scores.values())
        lo, hi = min(vals), max(vals)
        if hi - lo < 1e-9:
            return {k: 0.25 for k in scores}
        return {k: (v - lo) / (hi - lo) for k, v in scores.items()}

    @staticmethod
    def _softmax(scores: Dict[str, float], temperature: float = 1.0) -> Dict[str, float]:
        """Softmax normalisation — produces a probability distribution."""
        max_val = max(scores.values())
        exps = {k: math.exp((v - max_val) / temperature) for k, v in scores.items()}
        total = sum(exps.values())
        return {k: v / total for k, v in exps.items()}

    @staticmethod
    def _ranked_styles(profile: Dict[str, float]) -> List[Tuple[str, float]]:
        """Return styles sorted descending by score."""
        return sorted(profile.items(), key=lambda kv: kv[1], reverse=True)

    # ── public API ────────────────────────────────────────────────────

    def classify_from_onboarding(self, quiz_responses: List[dict]) -> Dict[str, float]:
        """Classify VARK style from onboarding quiz question responses.

        Each element of *quiz_responses* is expected to carry:
        - ``"selected_style"`` — one of *visual*, *auditory*,
          *reading_writing*, *kinesthetic* (the VARK category the chosen
          answer maps to).

        Optionally:
        - ``"weight"`` — per-question importance weight (default 1.0).

        Returns a normalised ``{style: score}`` dictionary with values in
        [0, 1].
        """
        raw: Dict[str, float] = {s: 0.0 for s in self.STYLES}

        if not quiz_responses:
            return {s: 0.25 for s in self.STYLES}

        for resp in quiz_responses:
            style = resp.get("selected_style", "").lower()
            weight = float(resp.get("weight", 1.0))
            if style in raw:
                raw[style] += weight

        return self._normalise(raw)

    def classify_from_interactions(
        self, interaction_signals: Dict[str, float]
    ) -> Dict[str, float]:
        """Classify VARK from implicit behavioural signals.

        *interaction_signals* maps signal names (matching keys in
        ``self.signal_weights``) to scalar values in [0, 1].  Unknown
        signals are silently ignored.

        Returns a normalised ``{style: score}`` dictionary in [0, 1].
        """
        raw: Dict[str, float] = {s: 0.0 for s in self.STYLES}

        if not interaction_signals:
            return {s: 0.25 for s in self.STYLES}

        for signal_name, signal_value in interaction_signals.items():
            weights = self.signal_weights.get(signal_name)
            if weights is None:
                continue
            # Clamp signal to [0, 1]
            clamped = max(0.0, min(1.0, float(signal_value)))
            for style in self.STYLES:
                raw[style] += clamped * weights.get(style, 0.0)

        return self._normalise(raw)

    def get_combined_profile(
        self,
        quiz_responses: List[dict],
        interaction_signals: Dict[str, float],
    ) -> dict:
        """Combine onboarding and interaction signals into a full VARK
        profile.

        Returns
        -------
        dict
            ``{
                "vark_scores": {style: float},
                "primary_style": str,
                "secondary_style": str,
                "confidence": float,
                "recommendations": dict
            }``
        """
        quiz_profile = self.classify_from_onboarding(quiz_responses)
        interaction_profile = self.classify_from_interactions(interaction_signals)

        # Weighted blend
        combined: Dict[str, float] = {}
        for style in self.STYLES:
            combined[style] = (
                self.quiz_weight * quiz_profile[style]
                + self.interaction_weight * interaction_profile[style]
            )

        # Re-normalise to [0, 1]
        combined = self._normalise(combined)

        ranked = self._ranked_styles(combined)
        primary_style = ranked[0][0]
        secondary_style = ranked[1][0] if len(ranked) > 1 else primary_style

        # Confidence: gap between 1st and 2nd strongest style.
        # A bigger gap → higher confidence that the primary style is dominant.
        confidence = ranked[0][1] - ranked[1][1] if len(ranked) > 1 else 1.0

        recommendations = self.recommend_content_format(combined)

        return {
            "vark_scores": combined,
            "primary_style": primary_style,
            "secondary_style": secondary_style,
            "confidence": round(confidence, 4),
            "recommendations": recommendations,
        }

    def recommend_content_format(self, vark_profile: Dict[str, float]) -> dict:
        """Recommend content delivery format based on VARK profile.

        Picks the format template of the dominant style and enriches it
        with blended preferences (e.g. TTS enabled if auditory score is
        above threshold).

        Returns
        -------
        dict
            Keys include ``primary_format``, ``secondary_format``,
            ``enable_tts``, ``prefer_infographics``,
            ``prefer_interactive_sim``, ``style_weights``.
        """
        ranked = self._ranked_styles(vark_profile)
        primary = ranked[0][0]
        secondary = ranked[1][0] if len(ranked) > 1 else primary

        base = dict(self._FORMAT_MAP.get(primary, self._FORMAT_MAP["visual"]))

        # Override secondary_format from the second-strongest style
        secondary_base = self._FORMAT_MAP.get(secondary, {})
        if secondary_base:
            base["secondary_format"] = secondary_base.get(
                "primary_format", base["secondary_format"]
            )

        # Cross-style enrichments
        auditory_score = vark_profile.get("auditory", 0.0)
        base["enable_tts"] = base.get("enable_tts", False) or auditory_score >= 0.5

        kinesthetic_score = vark_profile.get("kinesthetic", 0.0)
        base["prefer_interactive_sim"] = (
            base.get("prefer_interactive_sim", False) or kinesthetic_score >= 0.5
        )

        visual_score = vark_profile.get("visual", 0.0)
        base["prefer_infographics"] = (
            base.get("prefer_infographics", False) or visual_score >= 0.5
        )

        # Attach the raw weights for downstream consumers
        base["style_weights"] = vark_profile

        return base
