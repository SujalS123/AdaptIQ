import { Router, Request, Response } from 'express';
import { UserRepo } from '../repositories/UserRepo';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { authenticate } from '../middleware/auth';

const router = Router();
const userRepo = new UserRepo();

/* ─── helpers ─── */

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

// In-memory OTP store (keyed by email → { hash, expiresAt })
const otpStore = new Map<string, { hash: string; expiresAt: Date }>();

// In-memory refresh token store (keyed by token → { userId, expiresAt })
const refreshTokenStore = new Map<string, { userId: string; expiresAt: Date }>();

function generateAccessToken(user: { _id?: string; email: string; role: string }): string {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(userId: string): string {
  const token = jwt.sign({ id: userId, type: 'refresh' }, env.JWT_SECRET, { expiresIn: '7d' });
  refreshTokenStore.set(token, {
    userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return token;
}

/* ─── POST /register ─── */

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, languagePreference, accessibilitySettings } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Name, email, password, and role are required.' });
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      res.status(400).json({
        error: 'Password must be at least 8 characters with 1 uppercase letter, 1 digit, and 1 special character.',
      });
      return;
    }

    const existing = await userRepo.findByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await userRepo.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      isActive: true,
      languagePreference: languagePreference || 'en',
      accessibilitySettings: accessibilitySettings || {},
    });

    const accessToken = generateAccessToken(user);

    // Strip passwordHash from response
    const { passwordHash: _, ...safeUser } = user as any;

    res.status(201).json({ token: accessToken, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ─── POST /login ─── */

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await userRepo.findByEmail(email);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Check account lockout
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const remainingMs = new Date(user.lockUntil).getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      res.status(423).json({
        error: `Account temporarily locked. Try again in ${remainingMin} minute(s).`,
        lockUntil: user.lockUntil,
      });
      return;
    }

    // Verify password with bcrypt
    const isValid = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!isValid) {
      // Increment failed attempts
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const updates: any = { failedLoginAttempts: attempts };

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        updates.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      }

      await userRepo.update(user._id!, updates);

      res.status(401).json({
        error: 'Invalid email or password.',
        attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - attempts),
      });
      return;
    }

    // Successful login — reset failed attempts and track login
    const clientIP = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    await userRepo.update(user._id!, {
      failedLoginAttempts: 0,
      lockUntil: undefined,
      lastLoginAt: new Date(),
      lastLoginIP: clientIP,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user._id!);

    const { passwordHash: _, ...safeUser } = user as any;
    res.json({ token: accessToken, refreshToken, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ─── POST /refresh ─── */

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required.' });
      return;
    }

    const stored = refreshTokenStore.get(refreshToken);
    if (!stored || stored.expiresAt < new Date()) {
      refreshTokenStore.delete(refreshToken);
      res.status(401).json({ error: 'Invalid or expired refresh token.' });
      return;
    }

    // Verify the JWT signature too
    try {
      jwt.verify(refreshToken, env.JWT_SECRET);
    } catch {
      refreshTokenStore.delete(refreshToken);
      res.status(401).json({ error: 'Invalid refresh token.' });
      return;
    }

    const user = await userRepo.findById(stored.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ token: newAccessToken });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ─── POST /forgot-password ─── */

router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    const user = await userRepo.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ message: 'If this email exists, an OTP has been sent.' });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    otpStore.set(email.toLowerCase(), {
      hash: otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Mock email send — in production, integrate with email service
    console.log(`[MOCK EMAIL] OTP for ${email}: ${otp}`);

    res.json({ message: 'If this email exists, an OTP has been sent.', mockOtp: otp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ─── POST /reset-password ─── */

router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ error: 'Email, OTP, and new password are required.' });
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      res.status(400).json({
        error: 'Password must be at least 8 characters with 1 uppercase letter, 1 digit, and 1 special character.',
      });
      return;
    }

    const stored = otpStore.get(email.toLowerCase());
    if (!stored || stored.expiresAt < new Date()) {
      otpStore.delete(email.toLowerCase());
      res.status(400).json({ error: 'OTP has expired or is invalid.' });
      return;
    }

    const isOtpValid = await bcrypt.compare(otp, stored.hash);
    if (!isOtpValid) {
      res.status(400).json({ error: 'Invalid OTP.' });
      return;
    }

    // OTP is valid — update password
    otpStore.delete(email.toLowerCase());

    const user = await userRepo.findByEmail(email);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await userRepo.update(user._id!, { passwordHash, failedLoginAttempts: 0, lockUntil: undefined });

    res.json({ message: 'Password reset successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ─── PUT /profile (auth required) ─── */

router.put('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, languagePreference, avatarUrl, accessibilitySettings } = req.body;
    const userId = req.user!.id;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (languagePreference !== undefined) updates.languagePreference = languagePreference;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (accessibilitySettings !== undefined) updates.accessibilitySettings = accessibilitySettings;

    const updatedUser = await userRepo.update(userId, updates);

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = updatedUser as any;
    res.json({ user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ─── GET /me (auth required) ─── */

router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userRepo.findById(req.user!.id);

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = user as any;
    res.json({ user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ─── POST /auth/google (OAuth stub) ─── */

router.post('/auth/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    // Mock Google OAuth verification
    const mockGoogleUser = {
      _id: `google-${Date.now()}`,
      name: 'Google User',
      email: 'user@gmail.com',
      role: 'student' as const,
      isActive: true,
      languagePreference: 'en',
    };

    const token = generateAccessToken(mockGoogleUser);

    res.json({
      token,
      user: mockGoogleUser,
      provider: 'google',
      message: 'OAuth stub — Google sign-in mock successful.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ─── POST /auth/microsoft (OAuth stub) ─── */

router.post('/auth/microsoft', async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken: msToken } = req.body;

    // Mock Microsoft OAuth verification
    const mockMsUser = {
      _id: `microsoft-${Date.now()}`,
      name: 'Microsoft User',
      email: 'user@outlook.com',
      role: 'student' as const,
      isActive: true,
      languagePreference: 'en',
    };

    const token = generateAccessToken(mockMsUser);

    res.json({
      token,
      user: mockMsUser,
      provider: 'microsoft',
      message: 'OAuth stub — Microsoft sign-in mock successful.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
