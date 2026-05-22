import { Router, Request, Response } from 'express';

const router = Router();

export interface INoteItem {
  id: string;
  courseId: string;
  uploaderId: string;
  role: 'student' | 'teacher';
  title: string;
  content: string;
  bloomsLevel?: string;
  createdAt: Date;
}

// Global in-memory storage for notes with high-quality pre-seeded items
export const globalNotesStore: INoteItem[] = [
  {
    id: 'preseeded-teacher-notes-1',
    courseId: 'course-dbms',
    uploaderId: 'teacher-sharma',
    role: 'teacher',
    title: "Professor Sharma's Slide 14: Relational Normalization",
    content: `Database Normalization is the formal process of structuring a relational database to reduce data redundancy and improve data integrity. 
Slide 14 Highlights:
1. Normalization divides larger tables into smaller tables and links them using relationships.
2. The main goal is to isolate data so that additions, deletions, and modifications of a field can be made in just one table and then propagated through the rest of the database using defined foreign keys.
3. Transitive dependency: A functional dependency between non-key attributes that violates 3NF is eliminated by splitting the table.`,
    bloomsLevel: 'understand',
    createdAt: new Date()
  },
  {
    id: 'preseeded-teacher-notes-2',
    courseId: 'course-dbms',
    uploaderId: 'teacher-sharma',
    role: 'teacher',
    title: "Professor Sharma's Lecture: 3NF Decomposition Rules",
    content: `A relation schema R is in Third Normal Form (3NF) if, for every functional dependency X -> A, at least one of the following holds:
- X -> A is a trivial functional dependency (i.e., A is a subset of X)
- X is a superkey of R
- A is a prime attribute of R (i.e., A is part of some candidate key)
Decomposition into 3NF is always dependency-preserving and has a lossless join property.`,
    bloomsLevel: 'apply',
    createdAt: new Date()
  }
];

// Student upload notes endpoint
router.post('/student-notes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, studentId, title, content } = req.body;

    if (!courseId || !studentId || !title || !content) {
      res.status(400).json({ error: 'All fields (courseId, studentId, title, content) are required' });
      return;
    }

    const newNote: INoteItem = {
      id: `student-note-${Date.now()}`,
      courseId,
      uploaderId: studentId,
      role: 'student',
      title,
      content,
      createdAt: new Date()
    };

    globalNotesStore.push(newNote);
    console.log(`[Upload API] Added student notes: ${title}`);
    res.status(201).json({ message: 'Notes uploaded successfully!', note: newNote });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Teacher upload notes endpoint
router.post('/teacher-notes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, teacherId, title, content, bloomsLevel } = req.body;

    if (!courseId || !teacherId || !title || !content) {
      res.status(400).json({ error: 'All fields (courseId, teacherId, title, content) are required' });
      return;
    }

    const newNote: INoteItem = {
      id: `teacher-note-${Date.now()}`,
      courseId,
      uploaderId: teacherId,
      role: 'teacher',
      title,
      content,
      bloomsLevel: bloomsLevel || 'understand',
      createdAt: new Date()
    };

    globalNotesStore.push(newNote);
    console.log(`[Upload API] Added teacher course material: ${title} (Bloom: ${bloomsLevel})`);
    res.status(201).json({ message: 'Course material uploaded successfully!', note: newNote });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve all notes for a specific course (scoped by both roles)
router.get('/notes/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const notes = globalNotesStore.filter(n => n.courseId === courseId);
    res.json({ notes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
