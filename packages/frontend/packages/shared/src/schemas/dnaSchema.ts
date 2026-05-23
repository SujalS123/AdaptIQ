import { z } from 'zod';

export const onboardingSchema = z.object({
  mentorName: z.string().min(1, 'Please name your AI mentor'),
  learningModality: z.enum(['visual', 'auditory', 'reading', 'kinesthetic']),
  preferredExplanationStyles: z.array(z.string()).min(1, 'Select at least one style preference'),
  examGoals: z.array(z.object({
    examName: z.string(),
    targetDate: z.coerce.date(),
    priority: z.number().int(),
  })).min(1, 'Specify at least one target exam'),
});
