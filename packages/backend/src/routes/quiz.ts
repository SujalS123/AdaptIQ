import { Router, Request, Response } from 'express';
import { QuizRepo } from '../repositories/QuizRepo';
import { LearnerDNARepo } from '../repositories/LearnerDNARepo';
import axios from 'axios';
import { env } from '../config/env';

const router = Router();
const quizRepo = new QuizRepo();
const dnaRepo = new LearnerDNARepo();

router.get('/config/:quizId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const quiz = await quizRepo.findById(quizId);

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    res.json({ quiz });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update MLE Ability (theta) based on answer responses
router.post('/attempt/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { history } = req.body; // Array of { q: IQuestion, correct: boolean }
    
    // Call the Python AI engine MLE estimator for high-precision psychometrics
    // If Python engine is not running, compute a basic local approximation MLE
    let newTheta = 0.0;
    try {
      const response = await axios.post(`${env.AI_ENGINE_URL}/irt/mle`, {
        student_id: studentId,
        responses: history.map((h: any) => ({
          question_id: h.q.id,
          correct: h.correct,
          a: h.q.discriminationA,
          b: h.q.difficultyB,
          c: h.q.guessingC
        }))
      }, { timeout: 2000 });
      
      newTheta = response.data.theta;
    } catch (err) {
      console.warn('⚠️ AI Engine unreachable for MLE. Running local EMA approximation.');
      // Local fallback calculation: average of difficulties weighted by correctness
      const currentDna = await dnaRepo.findByStudentId(studentId);
      const oldTheta = currentDna?.thetaEstimate || 0.0;
      let shift = 0.0;
      history.forEach((h: any) => {
        const diff = h.q.difficultyB;
        if (h.correct) {
          // If correct, pull theta up, especially if question is harder than current ability
          shift += Math.max(0.1, (diff - oldTheta) * 0.2 + 0.1);
        } else {
          // If incorrect, pull theta down, especially if question is easier than current ability
          shift -= Math.max(0.1, (oldTheta - diff) * 0.2 + 0.1);
        }
      });
      // Clamp theta shift between -0.8 and +0.8 per quiz to avoid extreme jumps
      shift = Math.max(-0.8, Math.min(0.8, shift));
      newTheta = oldTheta + shift;
    }

    // Update student's Learner DNA profile
    const updatedDna = await dnaRepo.updateByStudentId(studentId, {
      thetaEstimate: newTheta
    });

    res.json({ theta: newTheta, dna: updatedDna });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
