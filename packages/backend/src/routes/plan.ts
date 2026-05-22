import { Router, Request, Response } from 'express';
import { StudyPlanRepo } from '../repositories/StudyPlanRepo';

const router = Router();
const planRepo = new StudyPlanRepo();

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

export default router;
