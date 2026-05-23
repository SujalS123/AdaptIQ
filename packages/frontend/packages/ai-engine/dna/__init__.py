"""
Learner DNA Module — VARK profiling, mastery tracking, and attention analysis.
"""
from .learning_style_detector import VARKDetector
from .mastery_calculator import MasteryCalculator
from .attention_window_detector import AttentionWindowDetector
from .dna_service import LearnerDNAService
from .updater import DNAUpdater

__all__ = [
    "VARKDetector",
    "MasteryCalculator",
    "AttentionWindowDetector",
    "LearnerDNAService",
    "DNAUpdater",
]
