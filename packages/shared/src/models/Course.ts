import mongoose, { Schema, Document } from 'mongoose';
import { ICourse } from '../types/courses.js';

export interface ICourseDocument extends Omit<ICourse, '_id'>, Document {}

const KnowledgeConceptSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  prerequisites: [{ type: String }],
  bloomsLevel: { type: String, enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'], default: 'understand' },
});

const CourseModuleSchema = new Schema({
  moduleId: { type: String, required: true },
  title: { type: String, required: true },
  sequenceOrder: { type: Number, required: true },
  contentUrl: { type: String },
  durationMinutes: { type: Number, default: 30 },
  conceptsTaught: [{ type: String }],
  notesContent: { type: String },
});

const CourseSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    domain: { type: String, enum: ['school', 'college', 'competitive', 'career'], required: true },
    examTags: [{ type: String }],
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    modules: [CourseModuleSchema],
    knowledgeGraph: {
      concepts: [KnowledgeConceptSchema],
    },
    isPublished: { type: Boolean, default: false },
    enrollmentCount: { type: Number, default: 0 },
    language: { type: String, default: 'en' },
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const CourseModel = mongoose.model<ICourseDocument>('Course', CourseSchema);
export default CourseModel;
