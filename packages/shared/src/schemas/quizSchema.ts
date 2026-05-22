import { z } from 'zod';

export const quizSubmissionSchema = z.object({
  quizId: z.string(),
  courseId: z.string().optional(),
  responses: z.array(z.object({
    questionId: z.string(),
    selectedOptionIndex: z.number().int().min(0),
    timeSpentSeconds: z.number().min(0),
  })).min(1, 'Cannot submit an empty quiz attempt'),
});
