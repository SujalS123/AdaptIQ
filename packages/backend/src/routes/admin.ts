import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/admin/users — List all platform users with roles
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      users: [
        { id: 'u-001', name: 'Priya Sharma', email: 'priya@univ.edu', role: 'student', status: 'active', lastLogin: '2026-05-22T10:30:00Z' },
        { id: 'u-002', name: 'Dr. Anil Sharma', email: 'sharma@univ.edu', role: 'teacher', status: 'active', lastLogin: '2026-05-22T08:15:00Z' },
        { id: 'u-003', name: 'Rahul Verma', email: 'rahul@univ.edu', role: 'student', status: 'at-risk', lastLogin: '2026-05-18T14:00:00Z' },
        { id: 'u-004', name: 'Admin Kumar', email: 'admin@univ.edu', role: 'admin', status: 'active', lastLogin: '2026-05-22T09:00:00Z' },
      ],
      total: 4,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/users/:userId — Update user role or status
router.patch('/users/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role, status } = req.body;
    res.json({
      userId,
      role: role || 'student',
      status: status || 'active',
      updatedAt: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/analytics — Platform-wide analytics summary
router.get('/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      totalStudents: 342,
      totalTeachers: 18,
      totalCourses: 12,
      totalQuizAttempts: 4821,
      avgPlatformTheta: 0.34,
      dailyActiveUsers: 127,
      weeklyRetention: 0.78,
      topCourses: [
        { name: 'DBMS', enrolled: 64, avgTheta: 0.42 },
        { name: 'DAA', enrolled: 58, avgTheta: 0.78 },
        { name: 'CNS', enrolled: 51, avgTheta: 0.21 },
      ],
      thetaDistribution: {
        below_minus1: 28,
        minus1_to_0: 89,
        zero_to_1: 156,
        above_1: 69,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/institution — Institution and billing details
router.get('/institution', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      name: 'National Engineering University',
      plan: 'Enterprise',
      activeLicenses: 400,
      usedLicenses: 360,
      billingCycle: 'annual',
      nextBillingDate: '2027-01-01',
      features: ['IRT Engine', 'Nova AI Tutor', 'RAG Pipeline', 'Interview Coach', 'Analytics Dashboard'],
      departments: [
        { name: 'Computer Science', students: 215, teachers: 12 },
        { name: 'Electronics', students: 89, teachers: 4 },
        { name: 'Mechanical', students: 56, teachers: 2 },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
