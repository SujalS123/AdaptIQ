import { Router, Request, Response } from 'express';
import { MentorMemoryRepo } from '../repositories/MentorMemoryRepo';
import { NovaSessionRepo } from '../repositories/NovaSessionRepo';

const router = Router();
const memoryRepo = new MentorMemoryRepo();
const sessionRepo = new NovaSessionRepo();

router.get('/memories/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const memories = await memoryRepo.getMemories(studentId);
    res.json({ memories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sessions/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const sessions = await sessionRepo.findByStudentId(studentId);
    res.json({ sessions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
