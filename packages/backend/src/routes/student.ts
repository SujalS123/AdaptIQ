import { Router, Request, Response } from 'express';
import { LearnerDNARepo } from '../repositories/LearnerDNARepo';

const router = Router();
const dnaRepo = new LearnerDNARepo();

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

export default router;
