import { Router, Request, Response } from 'express';
import { UserRepo } from '../repositories/UserRepo';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const router = Router();
const userRepo = new UserRepo();

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

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if email already exists
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    // Create user
    const newUser = await userRepo.create({
      _id: `user-${Date.now()}`,
      name,
      email,
      passwordHash: password, // Simplified for mock
      role: role || 'student',
      isActive: true,
      languagePreference: 'en'
    });

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: newUser });
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
