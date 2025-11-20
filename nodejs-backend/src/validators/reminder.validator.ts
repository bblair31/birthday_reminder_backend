import { z } from 'zod';

export const createReminderSchema = z.object({
  body: z.object({
    personName: z.string().min(1, 'Person name is required').max(100),
    relation: z.string().min(1, 'Relation is required').max(50),
    birthday: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    phone: z.string().optional().nullable(),
    email: z.string().email('Invalid email').optional().nullable(),
    sendReminder: z.boolean().optional().default(true),
    daysBeforeReminder: z.number().int().min(0).max(30).optional().default(1),
    reminderMethod: z.enum(['SMS', 'EMAIL', 'BOTH']).optional().default('EMAIL'),
    notes: z.string().max(1000).optional().nullable(),
    message: z
      .object({
        content: z.string().min(1).max(500),
      })
      .optional(),
  }),
});

export const updateReminderSchema = z.object({
  body: z.object({
    personName: z.string().min(1).max(100).optional(),
    relation: z.string().min(1).max(50).optional(),
    birthday: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .optional(),
    phone: z.string().optional().nullable(),
    email: z.string().email('Invalid email').optional().nullable(),
    sendReminder: z.boolean().optional(),
    daysBeforeReminder: z.number().int().min(0).max(30).optional(),
    reminderMethod: z.enum(['SMS', 'EMAIL', 'BOTH']).optional(),
    notes: z.string().max(1000).optional().nullable(),
    message: z
      .object({
        content: z.string().min(1).max(500),
      })
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid reminder ID'),
  }),
});

export const getReminderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid reminder ID'),
  }),
});

export const listRemindersSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional().default('1'),
    limit: z.string().transform(Number).optional().default('20'),
    sortBy: z.enum(['personName', 'birthday', 'createdAt']).optional().default('birthday'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    relation: z.string().optional(),
    month: z.string().transform(Number).optional(),
    upcoming: z.string().transform((val) => val === 'true').optional(),
  }),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>['body'];
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>['body'];
export type ListRemindersQuery = z.infer<typeof listRemindersSchema>['query'];
