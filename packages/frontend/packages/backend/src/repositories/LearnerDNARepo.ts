import { LearnerDNAModel, ILearnerDNA } from '@adaptiq/shared';
import mongoose from 'mongoose';

// Offline fallback DNA record for Priya
const mockDNAs: Map<string, ILearnerDNA> = new Map([
  [
    'student-priya',
    {
      studentId: 'student-priya' as any,
      mentorName: 'Nova',
      learningModality: 'visual',
      comprehensionSpeed: 1.2,
      attentionWindowMin: 42,
      bestStudyTime: '21:00-23:00',
      examGoals: [
        {
          examName: 'GATE',
          targetDate: new Date('2027-02-10'),
          priority: 1,
          coveragePercentage: 62,
        }
      ],
      enrolledCourses: [
        {
          courseId: 'course-dbms' as any,
          subject: 'DBMS',
          pineconeNamespace: 'cse-sem-5-dbms',
        }
      ],
      masteryScores: [
        {
          conceptId: 'db-keys',
          subject: 'DBMS',
          domain: 'Relational Database Design',
          confidence: 0.92,
          lastTested: new Date(),
          nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days later
        },
        {
          conceptId: 'normalization-1nf-2nf',
          subject: 'DBMS',
          domain: 'Relational Database Design',
          confidence: 0.78,
          lastTested: new Date(),
          nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days later
        },
        {
          conceptId: 'normalization-3nf-bcnf',
          subject: 'DBMS',
          domain: 'Relational Database Design',
          confidence: 0.35,
          lastTested: new Date(),
          nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // tomorrow
        }
      ],
      weakConcepts: ['normalization-3nf-bcnf', 'multivalued-dependencies-4nf'],
      xpPoints: 450,
      level: 3,
      streakDays: 12,
      streakBest: 15,
      badges: ['FastLearner', 'DBExplorer'],
      thetaEstimate: 1.45,
      preferredExplanationStyles: ['cricket analogies', 'step-by-step visualizations'],
      riskScore: 0.15, // healthy, low risk of dropout
    }
  ]
]);

export class LearnerDNARepo {
  private isOnline(): boolean {
    return mongoose.connection.readyState === 1;
  }

  async findByStudentId(studentId: string): Promise<ILearnerDNA | null> {
    if (this.isOnline() && mongoose.Types.ObjectId.isValid(studentId)) {
      return await LearnerDNAModel.findOne({ studentId }).lean();
    }
    return mockDNAs.get(studentId) || null;
  }

  async create(dnaData: ILearnerDNA): Promise<ILearnerDNA> {
    if (this.isOnline()) {
      const doc = new LearnerDNAModel(dnaData);
      const saved = await doc.save();
      return saved.toObject();
    }
    const studentIdStr = String(dnaData.studentId);
    mockDNAs.set(studentIdStr, dnaData);
    return dnaData;
  }

  async updateByStudentId(studentId: string, updates: Partial<ILearnerDNA>): Promise<ILearnerDNA | null> {
    if (this.isOnline() && mongoose.Types.ObjectId.isValid(studentId)) {
      return await LearnerDNAModel.findOneAndUpdate({ studentId }, updates, { new: true }).lean();
    }
    const existing = mockDNAs.get(studentId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    mockDNAs.set(studentId, updated);
    return updated;
  }
}
