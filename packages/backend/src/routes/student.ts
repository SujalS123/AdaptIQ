import { Router, Request, Response } from 'express';
import { LearnerDNARepo } from '../repositories/LearnerDNARepo';
import axios from 'axios';
import { env } from '../config/env';
import { CourseRepo } from '../repositories/CourseRepo';
import { UserRepo } from '../repositories/UserRepo';
import { authenticate } from '../middleware/auth';

const router = Router();
const dnaRepo = new LearnerDNARepo();
const courseRepo = new CourseRepo();
const userRepo = new UserRepo();


router.get('/dna/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const dna = await dnaRepo.findByStudentId(studentId);

    if (!dna) {
      res.status(404).json({ error: 'Learner DNA profile not found' });
      return;
    }

    res.json({ dna });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/dna/:studentId/xp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { xpAmount } = req.body;
    
    const dna = await dnaRepo.findByStudentId(studentId);
    if (!dna) {
      res.status(404).json({ error: 'Learner DNA not found' });
      return;
    }

    const currentXp = (dna.xpPoints || 0) + xpAmount;
    // Simple level up formula: every 500 XP is a level
    const currentLevel = Math.floor(currentXp / 500) + 1;
    
    const updated = await dnaRepo.updateByStudentId(studentId, {
      xpPoints: currentXp,
      level: currentLevel
    });

    res.json({ dna: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/student/dna/:studentId/vark — Update VARK learning style based on interaction signals
router.post('/dna/:studentId/vark', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { interactionSignals, quizResponses } = req.body;
    
    // Call the Python AI engine for VARK classification
    let primaryStyle = 'visual';
    let recommendations = {};
    
    try {
      const response = await axios.post(`${env.AI_ENGINE_URL}/dna/vark`, {
        quiz_responses: quizResponses || [],
        interaction_signals: interactionSignals || {}
      }, { timeout: 2000 });
      
      primaryStyle = response.data.primary_style;
      recommendations = response.data.recommendations;
    } catch (err) {
      console.warn('⚠️ AI Engine /dna/vark unreachable. Running fallback rule-based VARK detector.');
      // Local fallback rules
      if (interactionSignals) {
        const { video_completion_rate = 0, text_reading_time = 0, exercise_attempt_rate = 0, audio_replay_count = 0 } = interactionSignals;
        const scores: any = {
          visual: video_completion_rate * 0.7 + (interactionSignals.diagram_interaction_rate || 0) * 0.9,
          auditory: audio_replay_count * 0.9 + video_completion_rate * 0.5,
          reading: text_reading_time * 0.9 + (interactionSignals.note_taking_frequency || 0) * 0.8,
          kinesthetic: exercise_attempt_rate * 0.9
        };
        const ranked = Object.entries(scores).sort((a: any, b: any) => b[1] - a[1]);
        primaryStyle = ranked[0][0];
      }
    }
    
    const mapping: Record<string, string> = {
      visual: 'visual',
      auditory: 'auditory',
      reading: 'reading',
      kinesthetic: 'kinesthetic',
      reading_writing: 'reading'
    };
    
    const styleKey = mapping[primaryStyle] || 'visual';
    const explanationStyles = [
      styleKey === 'visual' ? 'step-by-step visualizations' :
      styleKey === 'auditory' ? 'verbal explanation podcasts' :
      styleKey === 'reading' ? 'detailed textual textbooks' :
      'cricket analogies & interactive coding drills'
    ];

    const updated = await dnaRepo.updateByStudentId(studentId, {
      learningModality: styleKey as any,
      preferredExplanationStyles: explanationStyles
    });

    res.json({ success: true, learningModality: styleKey, recommendations, dna: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/courses/all — Fetch all active courses
router.get('/courses/all', async (req: Request, res: Response) => {
  try {
    const courses = await courseRepo.findAll();
    res.json({ courses });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/student/courses/:courseId/join — Join a course
router.post('/courses/:courseId/join', async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id || 'student-priya';
    const { courseId } = req.params;

    const success = await courseRepo.joinCourse(courseId, studentId);
    if (!success) {
      res.status(400).json({ error: 'Failed to join course. Course or student not found.' });
      return;
    }

    // Award 100 XP Points for joining
    const dna = await dnaRepo.findByStudentId(studentId);
    let updatedDna = null;
    if (dna) {
      const currentXp = (dna.xpPoints || 0) + 100;
      const currentLevel = Math.floor(currentXp / 500) + 1;
      updatedDna = await dnaRepo.updateByStudentId(studentId, {
        xpPoints: currentXp,
        level: currentLevel
      });
    }

    res.json({ success: true, message: 'Joined course successfully. Awarded 100 XP!', dna: updatedDna });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/courses/joined — Fetch all joined courses for active student
router.get('/courses/joined', async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id || 'student-priya';
    const user = await userRepo.findById(studentId);
    const enrolledIds = user?.enrolledCourses || [];
    const allCourses = await courseRepo.findAll();
    
    const joined = allCourses.filter(c => {
      const idStr = c._id?.toString() || '';
      const hasId = enrolledIds.includes(idStr);
      const hasStudent = c.enrolledStudents?.includes(studentId);
      return hasId || hasStudent;
    });

    res.json({ courses: joined });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/courses/:courseId — Get course details
router.get('/courses/:courseId', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const course = await courseRepo.findById(courseId);
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }
    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
