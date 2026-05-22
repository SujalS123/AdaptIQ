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
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
export default UserModel;
