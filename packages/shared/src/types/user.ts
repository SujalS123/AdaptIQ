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
}
