import { Router, Request, Response } from 'express';
import axios from 'axios';
import { env } from '../config/env';
import { CourseRepo } from '../repositories/CourseRepo';
import { authenticate } from '../middleware/auth';

const router = Router();
const courseRepo = new CourseRepo();


// GET /api/teacher/classes — Class overview with aggregate metrics
router.get('/classes', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      classes: [
        {
          id: 'class-dbms-5a',
          name: "Professor Sharma's DBMS — CSE SEM-5 Section A",
          enrolled: 64,
          avgTheta: 0.42,
          atRiskCount: 7,
        },
        {
          id: 'class-daa-4b',
          name: 'Design & Analysis of Algorithms — CSE SEM-4 Section B',
          enrolled: 58,
          avgTheta: 0.78,
          atRiskCount: 3,
        },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teacher/class-overview — aggregated class metrics
router.get('/class-overview', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      totalActiveStudents: 47,
      meanCompletion: 73,
      avgQuizScore: 68.5,
      avgStreak: 12,
      conceptHeatmap: [
        { concept: 'Normalization (BCNF)', failRate: 15 },
        { concept: 'Indexing & B+ Trees', failRate: 42 },
        { concept: 'SQL Multi-Joins', failRate: 8 },
        { concept: 'Deadlocks', failRate: 67 },
        { concept: 'ACID Properties', failRate: 23 },
        { concept: 'ER Diagrams', failRate: 12 },
        { concept: 'Relational Algebra', failRate: 35 },
        { concept: 'Concurrency Control', failRate: 48 },
        { concept: 'Transaction Isolation', failRate: 42 },
        { concept: 'Query Optimization', failRate: 58 },
        { concept: 'NoSQL Databases', failRate: 18 },
        { concept: 'Database Security', failRate: 25 }
      ],
      topFailedConcepts: [
        { concept: 'Deadlocks', failRate: 67, attempts: 89 },
        { concept: 'B+ Tree Indexing', failRate: 54, attempts: 72 },
        { concept: 'Transaction Isolation', failRate: 42, attempts: 65 }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teacher/alerts — At-risk student alerts
router.get('/alerts', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      alerts: [
        {
          studentId: 'student-001',
          name: 'Rahul Verma',
          risk: 'high',
          theta: -0.65,
          reason: 'Declining quiz scores over 3 consecutive sessions',
          course: 'DBMS',
        },
        {
          studentId: 'student-014',
          name: 'Sneha Patel',
          risk: 'medium',
          theta: -0.12,
          reason: 'No quiz attempts in last 10 days',
          course: 'DBMS',
        },
        {
          studentId: 'student-031',
          name: 'Arjun Mehta',
          risk: 'high',
          theta: -0.89,
          reason: 'Consistently scoring below chance-level guessing parameter',
          course: 'DAA',
        },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teacher/student/:studentId — Individual student detail
router.get('/student/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    res.json({
      studentId,
      name: 'Rahul Verma',
      email: 'rahul.verma@university.edu',
      theta: -0.65,
      quizzesTaken: 8,
      averageScore: 42,
      weakConcepts: ['3NF Decomposition', 'BCNF Violations', 'Functional Dependencies'],
      recentActivity: [
        { date: '2026-05-20', type: 'quiz', score: 35, topic: 'Normalization' },
        { date: '2026-05-18', type: 'study', duration: 22, topic: 'ER Diagrams' },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teacher/assignments — Create an assignment
router.post('/assignments', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, courseId, dueDate, conceptTags } = req.body;
    res.status(201).json({
      id: `asgn-${Date.now()}`,
      title,
      courseId,
      dueDate,
      conceptTags,
      status: 'published',
      createdAt: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teacher/generate-quiz — IRT-calibrated quiz generation
router.post('/generate-quiz', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, courseId, numQuestions, difficultyRange, conceptTags } = req.body;
    const questions = Array.from({ length: numQuestions || 10 }, (_, i) => ({
      id: `q-gen-${Date.now()}-${i}`,
      text: `Generated question ${i + 1} on ${(conceptTags || ['general'])[i % (conceptTags || ['general']).length]}`,
      difficultyB: difficultyRange
        ? difficultyRange[0] + Math.random() * (difficultyRange[1] - difficultyRange[0])
        : Math.random() * 4 - 2,
      discriminationA: 0.8 + Math.random() * 1.2,
      guessingC: 0.25,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: Math.floor(Math.random() * 4),
    }));

    res.status(201).json({
      quizId: `quiz-gen-${Date.now()}`,
      title,
      courseId,
      questions,
      irtStats: {
        meanDifficulty:
          questions.reduce((s, q) => s + q.difficultyB, 0) / questions.length,
        stdDifficulty: 0.62,
        testInformation: 8.4,
      },
      createdAt: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/teacher/courses/my-courses — Get courses created by the teacher
router.get('/courses/my-courses', async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id || 'teacher-sharma';
    const courses = await courseRepo.findAll();
    const filtered = courses.filter(c => c.createdBy === teacherId);
    res.json({ courses: filtered });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teacher/courses — Create a course shell
router.post('/courses', async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.id || 'teacher-sharma';
    const { title, subject, domain, examTags, language, chaptersCount } = req.body;
    const count = Number(chaptersCount || 1);
    const modules = Array.from({ length: count }, (_, i) => ({
      moduleId: `module-${Date.now()}-${i + 1}`,
      title: `Chapter ${i + 1}`,
      sequenceOrder: i + 1,
      durationMinutes: 45,
      conceptsTaught: [],
      notesContent: ''
    }));
    
    // We can extract concepts for the knowledgeGraph based on chapters if needed, or default it
    const concepts = Array.from({ length: count }, (_, i) => ({
      id: `concept-${Date.now()}-${i + 1}`,
      name: `Chapter ${i + 1} Core Concept`,
      prerequisites: i > 0 ? [`concept-${Date.now()}-${i}`] : [],
      bloomsLevel: 'understand' as const
    }));

    const courseData = {
      title,
      subject,
      domain,
      examTags: examTags || [],
      createdBy: teacherId,
      modules,
      knowledgeGraph: {
        concepts
      },
      isPublished: true,
      enrollmentCount: 0,
      language: language || 'en',
      enrolledStudents: []
    };
    
    const created = await courseRepo.create(courseData);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teacher/courses/:courseId/chapters/:moduleId/notes — Save chapter notes and index in RAG
router.post('/courses/:courseId/chapters/:moduleId/notes', async (req: Request, res: Response) => {
  try {
    const { courseId, moduleId } = req.params;
    const { notesContent } = req.body;
    
    const success = await courseRepo.updateModuleNotes(courseId, moduleId, notesContent);
    if (!success) {
      res.status(404).json({ error: 'Course or Chapter not found.' });
      return;
    }

    // Call FastAPI AI Engine to index chapter
    try {
      await axios.post(`${env.AI_ENGINE_URL}/nova/index-chapter`, {
        course_id: courseId,
        chapter_id: moduleId,
        notes_content: notesContent
      });
    } catch (aiError: any) {
      console.error('Failed to index chapter notes in AI Engine:', aiError.message);
      // We don't fail the whole request because notes are saved in DB/mock successfully.
    }

    res.json({ success: true, message: 'Notes uploaded and indexing initiated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/teacher/courses/:courseId/chapters/:moduleId/upload-file — Upload a syllabus file (PDF/DOCX/PPTX/TXT) and index in RAG
router.post('/courses/:courseId/chapters/:moduleId/upload-file', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;
    const { fileName, fileType, base64Data } = req.body;
    
    if (!fileName || !fileType || !base64Data) {
      res.status(400).json({ error: 'Missing fileName, fileType, or base64Data.' });
      return;
    }

    // Forward to Python AI microservice to extract text and index in Pinecone/BM25
    let extractedText = '';
    try {
      const aiResponse = await axios.post(`${env.AI_ENGINE_URL}/nova/index-file`, {
        course_id: courseId,
        chapter_id: moduleId,
        file_name: fileName,
        file_type: fileType,
        base64_data: base64Data
      });
      extractedText = aiResponse.data.extracted_text || '';
    } catch (aiError: any) {
      console.error('Failed to extract & index file in AI Engine:', aiError.response?.data?.detail || aiError.message);
      res.status(500).json({ error: `AI Engine file extraction failed: ${aiError.response?.data?.detail || aiError.message}` });
      return;
    }

    // Sync clean extracted text to chapter's notesContent in Mongoose/Mock storage
    const success = await courseRepo.updateModuleNotes(courseId, moduleId, extractedText);
    if (!success) {
      res.status(404).json({ error: 'Course or Chapter not found for sync.' });
      return;
    }

    res.json({
      success: true,
      message: `File '${fileName}' parsed, indexed, and synchronized successfully.`,
      extractedText
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/teacher/courses/:courseId — Update course metadata and modules list
router.put('/courses/:courseId', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, subject, domain, examTags, language, modules } = req.body;
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (subject !== undefined) updateData.subject = subject;
    if (domain !== undefined) updateData.domain = domain;
    if (examTags !== undefined) updateData.examTags = examTags;
    if (language !== undefined) updateData.language = language;
    if (modules !== undefined) updateData.modules = modules;

    const updated = await courseRepo.updateCourse(courseId, updateData);
    if (!updated) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

