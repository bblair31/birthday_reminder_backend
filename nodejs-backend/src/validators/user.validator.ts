import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phone: z.string().optional().nullable(),
    timezone: z.string().optional(),
    preferredReminder: z.enum(['SMS', 'EMAIL', 'BOTH']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
