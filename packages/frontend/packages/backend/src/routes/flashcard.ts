import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/flashcards/:courseId/:moduleId
router.get('/:courseId/:moduleId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;
    
    // In a real app, we would query CourseModel and parse the teacher's notesContent into flashcards
    // Mock Flashcards
    const flashcards = [
      { id: 'fc-1', front: 'What is a Primary Key?', back: 'A column or a set of columns that uniquely identifies each row in a table.' },
      { id: 'fc-2', front: 'What does ACID stand for?', back: 'Atomicity, Consistency, Isolation, Durability' },
      { id: 'fc-3', front: 'What is a Foreign Key?', back: 'A field (or collection of fields) in one table that uniquely identifies a row of another table.' },
      { id: 'fc-4', front: 'What is Normalization?', back: 'The process of organizing data in a database to reduce redundancy and improve data integrity.' }
    ];

    res.json({ flashcards });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
