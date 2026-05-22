import mongoose, { Schema, Document } from 'mongoose';
import { ILearnerDNA } from '../types/learnerDNA.js';

export interface ILearnerDNADocument extends ILearnerDNA, Document {}

const ExamGoalSchema = new Schema({
  examName: { type: String, required: true },
  targetDate: { type: Date, required: true },
  priority: { type: Number, default: 1 },
  coveragePercentage: { type: Number, default: 0 },
});

const EnrolledCourseSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution' },
  subject: { type: String, required: true },
  gradeLevel: { type: String },
  pineconeNamespace: { type: String, required: true },
});

const ConceptMasterySchema = new Schema({
  conceptId: { type: String, required: true },
  subject: { type: String, required: true },
  domain: { type: String, required: true },
  confidence: { type: Number, default: 0.0, min: 0.0, max: 1.0 },
  lastTested: { type: Date },
  nextReviewDate: { type: Date },
});

const LearnerDNASchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    mentorName: { type: String, default: 'Nova' },
    learningModality: { type: String, enum: ['visual', 'auditory', 'reading', 'kinesthetic'], default: 'visual' },
    comprehensionSpeed: { type: Number, default: 1.0 },
    attentionWindowMin: { type: Number, default: 45 },
    bestStudyTime: { type: String, default: '19:00-21:00' },
    examGoals: [ExamGoalSchema],
    enrolledCourses: [EnrolledCourseSchema],
    masteryScores: [ConceptMasterySchema],
    weakConcepts: [{ type: String }],
    xpPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    streakBest: { type: Number, default: 0 },
    badges: [{ type: String }],
    thetaEstimate: { type: Number, default: 0.0 },
    preferredExplanationStyles: [{ type: String }],
    riskScore: { type: Number, default: 0.0 },
  },
  { timestamps: true }
);

export const LearnerDNAModel = mongoose.model<ILearnerDNADocument>('LearnerDNA', LearnerDNASchema);
export default LearnerDNAModel;
