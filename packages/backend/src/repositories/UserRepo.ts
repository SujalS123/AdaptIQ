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
  ],
  [
    'admin-rohan',
    {
      _id: 'admin-rohan',
      name: 'Rohan (Admin)',
      email: 'admin@adaptiq.edu',
      passwordHash: '$2a$10$C8.1zM.8t3nZ8Q8U2XU.Nu2K42oQe28Ue.r8Y3d8U2Y2M2P2Q2r2a',
      role: 'admin',
      isActive: true,
      languagePreference: 'en',
    }
  ]
]);

export class UserRepo {
  private isOnline(): boolean {
    return mongoose.connection.readyState === 1;
  }

  async seedMockUsers(): Promise<void> {
    if (!this.isOnline()) return;

    for (const mockUser of mockUsers.values()) {
      const existing = await UserModel.findOne({ email: mockUser.email.toLowerCase() }).lean();
      if (!existing) {
        console.log(`🌱 Seeding demo account into live MongoDB: ${mockUser.email}`);
        await UserModel.create(mockUser);
      }
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    if (this.isOnline()) {
      const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
      if (user) return user as any;
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
      const user = await UserModel.findById(id).lean();
      if (user) return user as any;
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
