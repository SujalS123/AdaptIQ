import { Router, Request, Response } from 'express';
import { UserRepo } from '../repositories/UserRepo';
import { LearnerDNARepo } from '../repositories/LearnerDNARepo';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const router = Router();
const userRepo = new UserRepo();
const dnaRepo = new LearnerDNARepo();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await userRepo.findByEmail(email);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Mock password checking (simple string match or standard mock)
    // For demonstration, password 'password' works
    if (password !== 'password') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Signup - create user and initialize LearnerDNA (student signup)
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'student', enrolledCourses = [] } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'name, email and password are required' });
      return;
    }

    // Prevent duplicate email
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Use the same mock passwordHash as seeded users so 'password' works in the demo login
    const demoPasswordHash = '$2a$10$C8.1zM.8t3nZ8Q8U2XU.Nu2K42oQe28Ue.r8Y3d8U2Y2M2P2Q2r2a';

    const userData: any = {
      name,
      email: email.toLowerCase(),
      passwordHash: demoPasswordHash,
      role,
      isActive: true,
      languagePreference: 'en',
    };

    const createdUser = await userRepo.create(userData);

    // Initialize Learner DNA profile for students only
    let createdDna = null;
    if (role === 'student') {
      const dnaPayload: any = {
        studentId: createdUser._id,
        mentorName: 'Nova',
        enrolledCourses: enrolledCourses,
        xpPoints: 0,
        level: 1,
        thetaEstimate: 0.0,
        weakConcepts: [],
        preferredExplanationStyles: [],
        riskScore: 0.0,
      };
      createdDna = await dnaRepo.create(dnaPayload as any);
    }

    // Issue token so the user is effectively logged in after signup
    const token = jwt.sign({ id: createdUser._id, email: createdUser.email, role: createdUser.role }, env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ user: createdUser, dna: createdDna, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    const user = await userRepo.findById(decoded.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized/Invalid Token' });
  }
});

export default router;
