import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/user.js';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'parent', 'admin'], required: true },
    isActive: { type: Boolean, default: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution' },
    languagePreference: { type: String, default: 'en' },
    avatarUrl: { type: String },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    lastLoginAt: { type: Date },
    lastLoginIP: { type: String },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    accessibilitySettings: {
      dyslexiaMode: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false },
      fontSize: { type: String, enum: ['normal', 'large', 'xlarge'], default: 'normal' },
      reduceMotion: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
export default UserModel;
