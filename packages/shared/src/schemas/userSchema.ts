import { z } from 'zod';

export const userRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'teacher', 'parent', 'admin']),
  institutionCode: z.string().optional(),
  languagePreference: z.string().default('en'),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
