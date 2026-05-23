import { UserModel, IUser } from '@adaptiq/shared';
import mongoose from 'mongoose';

// Simple in-memory fallback store
const mockUsers: Map<string, IUser> = new Map([
  [
    'student-priya',
    {
      _id: 'student-priya',
      name: 'Priya Sharma',
      email: 'priya@adaptiq.edu',
      passwordHash: '$2a$10$C8.1zM.8t3nZ8Q8U2XU.Nu2K42oQe28Ue.r8Y3d8U2Y2M2P2Q2r2a', // mock bcrypt hash for 'password'
      role: 'student',
      isActive: true,
      languagePreference: 'en',
    }
  ],
  [
    'teacher-sharma',
    {
      _id: 'teacher-sharma',
      name: 'Professor Sharma',
      email: 'sharma@adaptiq.edu',
      passwordHash: '$2a$10$C8.1zM.8t3nZ8Q8U2XU.Nu2K42oQe28Ue.r8Y3d8U2Y2M2P2Q2r2a',
      role: 'teacher',
      isActive: true,
      languagePreference: 'en',
    }
  ]
]);

export class UserRepo {
  private isOnline(): boolean {
    return mongoose.connection.readyState === 1;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    if (this.isOnline()) {
      return (await UserModel.findOne({ email: email.toLowerCase() }).lean()) as any;
    }
    // Offline mock fallback
    for (const user of mockUsers.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<IUser | null> {
    if (this.isOnline() && mongoose.Types.ObjectId.isValid(id)) {
      return (await UserModel.findById(id).lean()) as any;
    }
    return mockUsers.get(id) || null;
  }

  async create(userData: IUser): Promise<IUser> {
    if (this.isOnline()) {
      const doc = new UserModel(userData);
      const saved = await doc.save();
      return saved.toObject() as any;
    }
    const newId = userData._id || `user-${Date.now()}`;
    const newUser = { ...userData, _id: newId, createdAt: new Date(), updatedAt: new Date() };
    mockUsers.set(newId, newUser);
    return newUser;
  }

  async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    if (this.isOnline() && mongoose.Types.ObjectId.isValid(id)) {
      return (await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean()) as any;
    }
    const existing = mockUsers.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    mockUsers.set(id, updated);
    return updated;
  }
}
