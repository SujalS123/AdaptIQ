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
