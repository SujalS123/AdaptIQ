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

    // Retrieve the student's current DNA
    const currentDna = await dnaRepo.findByStudentId(studentId);
    let masteryScores = currentDna?.masteryScores ? [...currentDna.masteryScores] : [];
    
    // Group history responses by conceptId
    const conceptUpdates: Record<string, { correct: number; total: number }> = {};
    history.forEach((h: any) => {
      const cId = h.q.conceptId || 'general';
      if (!conceptUpdates[cId]) {
        conceptUpdates[cId] = { correct: 0, total: 0 };
      }
      conceptUpdates[cId].total += 1;
      if (h.correct) {
        conceptUpdates[cId].correct += 1;
      }
    });

    // Update each concept's mastery score
    Object.entries(conceptUpdates).forEach(([cId, stats]) => {
      const index = masteryScores.findIndex(m => m.conceptId === cId);
      let currentConfidence = 0.5;
      let subject = 'DBMS';
      let domain = 'Relational Database Design';

      if (index !== -1) {
        currentConfidence = masteryScores[index].confidence;
        subject = masteryScores[index].subject;
        domain = masteryScores[index].domain;
      }

      // Bayesian-like incremental updates for each question
      let newConfidence = currentConfidence;
      
      for (let i = 0; i < stats.total; i++) {
        const isCorrect = i < stats.correct;
        if (isCorrect) {
          newConfidence = newConfidence + (1.0 - newConfidence) * 0.25;
        } else {
          newConfidence = newConfidence - newConfidence * 0.20;
        }
      }
      
      newConfidence = Math.max(0.05, Math.min(0.98, newConfidence));

      let intervalDays = 1;
      if (newConfidence > 0.8) {
        intervalDays = 7;
      } else if (newConfidence > 0.5) {
        intervalDays = 3;
      }

      const updatedConcept = {
        conceptId: cId,
        subject,
        domain,
        confidence: parseFloat(newConfidence.toFixed(2)),
        lastTested: new Date(),
        nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * intervalDays)
      };

      if (index !== -1) {
        masteryScores[index] = updatedConcept;
      } else {
        masteryScores.push(updatedConcept);
      }
    });

    // Derive weak concepts (confidence < 0.5)
    const weakConcepts = masteryScores
      .filter(m => m.confidence < 0.5)
      .map(m => m.conceptId);

    // Update student's Learner DNA profile
    const updatedDna = await dnaRepo.updateByStudentId(studentId, {
      thetaEstimate: newTheta,
      masteryScores,
      weakConcepts
    });

    res.json({ theta: newTheta, dna: updatedDna });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/quiz/diagnostic-baseline — Initialize student's Learner DNA with IRT baseline theta
router.post('/diagnostic-baseline', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, answers } = req.body; // answers is e.g. { "1": "Yes", "2": "64" }
    
    // Map of correct answers and their 3PL parameters
    const onboardingQuestions = [
      { id: 1, correct: 'Yes', a: 1.0, b: -0.5, c: 0.25 },
      { id: 2, correct: '64', a: 1.2, b: 0.0, c: 0.25 },
      { id: 3, correct: 'Liquid', a: 0.8, b: -1.0, c: 0.25 },
      { id: 4, correct: 'quickly', a: 0.9, b: -0.8, c: 0.25 },
      { id: 5, correct: 'Green', a: 1.1, b: -0.2, c: 0.25 }
    ];

    const history = onboardingQuestions.map(q => {
      const userAnswer = answers[q.id.toString()];
      const isCorrect = userAnswer === q.correct;
      return {
        question_id: `onboarding-${q.id}`,
        correct: isCorrect,
        a: q.a,
        b: q.b,
        c: q.c
      };
    });

    // Call the Python AI engine MLE estimator for high-precision psychometrics
    let newTheta = 0.0;
    try {
      const response = await axios.post(`${env.AI_ENGINE_URL}/irt/mle`, {
        student_id: studentId,
        responses: history
      }, { timeout: 2000 });
      
      newTheta = response.data.theta;
    } catch (err) {
      console.warn('⚠️ AI Engine unreachable for baseline MLE. Running local approximation.');
      // Local fallback calculation for baseline: average of correct/incorrect weighted
      let score = 0;
      onboardingQuestions.forEach(q => {
        if (answers[q.id.toString()] === q.correct) score++;
      });
      // Simple scaling from 0-5 to -2.0 to +2.0
      newTheta = (score - 2.5) * 0.8;
    }

    // Seed or update the student's Learner DNA profile
    let dna = await dnaRepo.findByStudentId(studentId);
    if (!dna) {
      dna = await dnaRepo.create({
        studentId: studentId as any,
        mentorName: 'Nova',
        learningModality: 'visual',
        comprehensionSpeed: 1.0,
        attentionWindowMin: 45,
        bestStudyTime: '20:00-22:00',
        examGoals: [
          {
            examName: 'GATE',
            targetDate: new Date('2027-02-10'),
            priority: 1,
            coveragePercentage: 10,
          }
        ],
        enrolledCourses: [
          {
            courseId: 'course-dbms' as any,
            subject: 'DBMS',
            pineconeNamespace: 'cse-sem-5-dbms',
          }
        ],
        masteryScores: [
          {
            conceptId: 'db-keys',
            subject: 'DBMS',
            domain: 'Relational Database Design',
            confidence: 0.1,
            lastTested: new Date(),
            nextReviewDate: new Date(),
          }
        ],
        weakConcepts: [],
        xpPoints: 100,
        level: 1,
        streakDays: 1,
        streakBest: 1,
        badges: ['Beginner'],
        thetaEstimate: newTheta,
        preferredExplanationStyles: ['step-by-step visualizations'],
        riskScore: 0.2,
      });
    } else {
      dna = await dnaRepo.updateByStudentId(studentId, {
        thetaEstimate: newTheta
      });
    }

    res.json({ theta: newTheta, dna });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
