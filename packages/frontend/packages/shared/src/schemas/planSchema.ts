import { z } from 'zod';

export const planAdjustmentSchema = z.object({
  examGoalName: z.string(),
  reason: z.string().min(3, 'Specify a reason for adjusting the calendar'),
  description: z.string(),
});
