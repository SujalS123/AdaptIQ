"""
Attention Window Detector
=========================
Analyses student session history to surface:

* **Peak hours** — time-of-day buckets when the student is most
  productive (highest quiz accuracy or longest focus spans).
* **Attention span** — estimated effective study duration before
  performance drops off.
* **Fatigue index** — per-session productivity fade-out metric.

All methods are stateless pure functions that operate on lists of
session dictionaries, making them easy to call from the DNA service
or from a background updater.
"""

from __future__ import annotations

import math
from collections import defaultdict
from typing import Dict, List, Optional


class AttentionWindowDetector:
    """Detects optimal study windows and attention patterns from session data."""

    # Human-readable labels for 4-hour time blocks
    _BLOCK_LABELS: Dict[int, str] = {
        0: "late_night",      # 00:00-03:59
        1: "early_morning",   # 04:00-07:59
        2: "morning",         # 08:00-11:59
        3: "afternoon",       # 12:00-15:59
        4: "evening",         # 16:00-19:59
        5: "night",           # 20:00-23:59
    }

    def detect_peak_hours(self, session_history: List[dict]) -> dict:
        """Identify when the student is most productive.

        Parameters
        ----------
        session_history : list[dict]
            Each dict should contain at least:
            - ``"start_hour"`` (int 0-23): hour the session started.
            - ``"duration_minutes"`` (float): total session length.
            - ``"productivity_score"`` (float, optional 0-1): a composite
              metric (quiz accuracy, pages read, etc.).  Falls back to 1.0
              if absent.

        Returns
        -------
        dict
            ``{
                "peak_block": str,        # e.g. "morning"
                "peak_hours": [int, int], # e.g. [8, 11]
                "block_scores": {block_label: avg_productivity},
                "total_sessions_analysed": int
            }``
        """
        if not session_history:
            return {
                "peak_block": "morning",
                "peak_hours": [8, 11],
                "block_scores": {},
                "total_sessions_analysed": 0,
            }

        # Accumulate weighted productivity into 4-hour blocks
        block_totals: Dict[int, float] = defaultdict(float)
        block_counts: Dict[int, int] = defaultdict(int)

        for session in session_history:
            hour = int(session.get("start_hour", 12))
            duration = float(session.get("duration_minutes", 30))
            productivity = float(session.get("productivity_score", 1.0))

            block_idx = hour // 4  # 0-5
            # Weight by duration so that longer sessions count more
            block_totals[block_idx] += productivity * duration
            block_counts[block_idx] += 1

        # Average weighted productivity per block
        block_avg: Dict[str, float] = {}
        best_idx = 0
        best_score = -1.0
        for idx in range(6):
            label = self._BLOCK_LABELS[idx]
            count = block_counts.get(idx, 0)
            if count > 0:
                avg = block_totals[idx] / count
            else:
                avg = 0.0
            block_avg[label] = round(avg, 4)
            if avg > best_score:
                best_score = avg
                best_idx = idx

        peak_label = self._BLOCK_LABELS[best_idx]
        peak_start = best_idx * 4
        peak_end = peak_start + 3

        return {
            "peak_block": peak_label,
            "peak_hours": [peak_start, peak_end],
            "block_scores": block_avg,
            "total_sessions_analysed": len(session_history),
        }

    def detect_attention_span(self, session_durations: List[float]) -> dict:
        """Calculate average effective attention span.

        The *effective* span is modelled as the duration at which
        marginal productivity starts declining, approximated here by the
        trimmed mean (excluding outlier sessions shorter than 5 min or
        longer than the 95th percentile) of observed session durations.

        Parameters
        ----------
        session_durations : list[float]
            Durations in **minutes** of individual study sessions.

        Returns
        -------
        dict
            ``{
                "average_span_minutes": float,
                "median_span_minutes": float,
                "recommended_session_length": float,
                "recommended_break_interval": float,
                "total_sessions": int
            }``
        """
        if not session_durations:
            return {
                "average_span_minutes": 25.0,
                "median_span_minutes": 25.0,
                "recommended_session_length": 25.0,
                "recommended_break_interval": 25.0,
                "total_sessions": 0,
            }

        # Filter out trivially short sessions (< 5 min)
        valid = [d for d in session_durations if d >= 5.0]
        if not valid:
            valid = list(session_durations)

        # Trim top 5 % outliers
        valid_sorted = sorted(valid)
        p95_idx = max(0, int(math.ceil(len(valid_sorted) * 0.95)) - 1)
        trimmed = valid_sorted[: p95_idx + 1] if p95_idx + 1 < len(valid_sorted) else valid_sorted

        avg_span = sum(trimmed) / len(trimmed) if trimmed else 25.0
        median_span = trimmed[len(trimmed) // 2] if trimmed else 25.0

        # Recommended session = average span capped between 15-90 min
        recommended = max(15.0, min(90.0, avg_span))

        # Break interval roughly 80 % of the span (Pomodoro-inspired)
        break_interval = max(10.0, recommended * 0.8)

        return {
            "average_span_minutes": round(avg_span, 2),
            "median_span_minutes": round(median_span, 2),
            "recommended_session_length": round(recommended, 2),
            "recommended_break_interval": round(break_interval, 2),
            "total_sessions": len(session_durations),
        }

    def compute_fatigue_index(self, session: dict) -> float:
        """Compute a 0-1 fatigue index for a single session.

        A value close to 1 means the student showed significant
        performance fade-out over the session.

        Parameters
        ----------
        session : dict
            Should contain ``"accuracy_first_half"`` and
            ``"accuracy_second_half"`` (both floats in [0, 1]).
            Falls back to 0 (no fatigue) when data is absent.

        Returns
        -------
        float
            Fatigue index in [0, 1].
        """
        first = float(session.get("accuracy_first_half", 0.5))
        second = float(session.get("accuracy_second_half", 0.5))

        if first < 1e-6:
            return 0.0

        # Drop ratio — how much accuracy fell from first to second half
        drop = max(0.0, first - second) / first
        return round(min(1.0, drop), 4)
