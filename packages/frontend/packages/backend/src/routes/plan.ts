import { Router, Request, Response } from 'express';
import { StudyPlanRepo } from '../repositories/StudyPlanRepo';
import { LearnerDNARepo } from '../repositories/LearnerDNARepo';
import axios from 'axios';
import { env } from '../config/env';

const router = Router();
const planRepo = new StudyPlanRepo();
const dnaRepo = new LearnerDNARepo();

router.get('/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const plan = await planRepo.findByStudentId(studentId);

    if (!plan) {
      res.status(404).json({ error: 'Study plan not found for student' });
      return;
    }

    res.json({ plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/plan/leitner/update — Calculate SM-2 spaced repetition and persist results + XP rewards
router.post('/leitner/update', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, conceptId, quality, prevInterval, prevRepetitions, prevEfactor, isSocraticBoost } = req.body;

    if (!studentId || !conceptId || quality === undefined) {
      res.status(400).json({ error: 'studentId, conceptId, and quality are required.' });
      return;
    }

    // Call Python AI microservice /planner/srs
    let nextInterval = 1;
    let nextRepetitions = 0;
    let newEfactor = 2.5;

    try {
      const response = await axios.post(`${env.AI_ENGINE_URL}/planner/srs`, {
        quality: parseInt(quality),
        prev_interval: parseInt(prevInterval || 0),
        prev_repetitions: parseInt(prevRepetitions || 0),
        prev_efactor: parseFloat(prevEfactor || 2.5)
      }, { timeout: 2000 });

      nextInterval = response.data.interval;
      nextRepetitions = response.data.repetitions;
      newEfactor = response.data.efactor;
    } catch (err) {
      console.warn('⚠️ AI Engine /planner/srs unreachable. Running fallback SM-2 calculation.');
      // Local fallback SM-2 math
      const q = Math.max(0, Math.min(5, parseInt(quality)));
      const prevRep = parseInt(prevRepetitions || 0);
      const prevInt = parseInt(prevInterval || 0);
      const prevEf = parseFloat(prevEfactor || 2.5);

      if (q >= 3) {
        if (prevRep === 0) {
          nextInterval = 1;
        } else if (prevRep === 1) {
          nextInterval = 6;
        } else {
          nextInterval = Math.round(prevInt * prevEf);
        }
        nextRepetitions = prevRep + 1;
      } else {
        nextRepetitions = 0;
        nextInterval = 1;
      }

      newEfactor = prevEf + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      newEfactor = Math.max(1.3, Math.min(3.0, newEfactor));
    }

    // Update LearnerDNA concept mastery and add XP points
    const currentDna = await dnaRepo.findByStudentId(studentId);
    if (!currentDna) {
      res.status(404).json({ error: 'Learner DNA not found.' });
      return;
    }

    // Determine XP award amount
    const xpReward = isSocraticBoost ? 100 : 50;
    const currentXp = (currentDna.xpPoints || 0) + xpReward;
    const currentLevel = Math.floor(currentXp / 500) + 1;

    let masteryScores = [...(currentDna.masteryScores || [])];
    const index = masteryScores.findIndex(m => m.conceptId === conceptId);
    
    // Calculate new concept confidence
    let currentConfidence = 0.5;
    let subject = 'DBMS';
    let domain = 'Relational Database Design';

    if (index !== -1) {
      currentConfidence = masteryScores[index].confidence;
      subject = masteryScores[index].subject;
      domain = masteryScores[index].domain;
    }

    // Adjust concept confidence based on review quality
    let newConfidence = currentConfidence;
    if (quality >= 3) {
      newConfidence = newConfidence + (1.0 - newConfidence) * 0.15;
    } else {
      newConfidence = newConfidence - newConfidence * 0.15;
    }
    newConfidence = Math.max(0.05, Math.min(0.98, newConfidence));

    const updatedConcept = {
      conceptId,
      subject,
      domain,
      confidence: parseFloat(newConfidence.toFixed(2)),
      lastTested: new Date(),
      nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * nextInterval)
    };

    if (index !== -1) {
      masteryScores[index] = updatedConcept;
    } else {
      masteryScores.push(updatedConcept);
    }

    const weakConcepts = masteryScores
      .filter(m => m.confidence < 0.5)
      .map(m => m.conceptId);

    const updated = await dnaRepo.updateByStudentId(studentId, {
      xpPoints: currentXp,
      level: currentLevel,
      masteryScores,
      weakConcepts
    });

    res.json({
      success: true,
      nextInterval,
      nextRepetitions,
      newEfactor,
      xpGained: xpReward,
      dna: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/plan/:studentId/items — Update the whole study plan items
router.post('/:studentId/items', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: 'items array is required' });
      return;
    }

    let plan = await planRepo.findByStudentId(studentId);
    if (!plan) {
      plan = {
        studentId,
        items,
        updatedAt: new Date()
      };
    } else {
      plan.items = items;
      plan.updatedAt = new Date();
    }

    await planRepo.save(plan);
    res.json({ success: true, plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

