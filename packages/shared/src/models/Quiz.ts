import mongoose, { Schema, Document } from 'mongoose';
import { IQuiz } from '../types/quiz.js';

export interface IQuizDocument extends Omit<IQuiz, '_id'>, Document {}

const QuestionSchema = new Schema({
  id: { type: String, required: true },
  conceptId: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanationText: { type: String, required: true },
  discriminationA: { type: Number, default: 1.0 },
  difficultyB: { type: Number, default: 0.0 },
  guessingC: { type: Number, default: 0.25 },
});

const QuizSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    conceptIds: [{ type: String, required: true }],
    questions: [QuestionSchema],
    isAdaptive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const QuizModel = mongoose.model<IQuizDocument>('Quiz', QuizSchema);
export default QuizModel;
