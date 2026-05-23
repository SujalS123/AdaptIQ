export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  isActive: boolean;
  institutionId?: string;
  languagePreference: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  failedLoginAttempts?: number;
  lockUntil?: Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  enrolledCourses?: string[]; // Array of course IDs enrolled
  accessibilitySettings?: {
    dyslexiaMode?: boolean;
    highContrast?: boolean;
    fontSize?: 'normal' | 'large' | 'xlarge';
    reduceMotion?: boolean;
  };
}
