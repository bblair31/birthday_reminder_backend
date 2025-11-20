import { z } from 'zod';

export const createMessageSchema = z.object({
  body: z.object({
    reminderId: z.string().uuid('Invalid reminder ID'),
    content: z.string().min(1, 'Message content is required').max(500, 'Message must be 500 characters or less'),
  }),
});

export const updateMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(500, 'Message must be 500 characters or less').optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid message ID'),
  }),
});

export const getMessageSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid message ID'),
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid message ID'),
  }),
  body: z.object({
    method: z.enum(['SMS', 'EMAIL', 'BOTH']).optional(),
  }),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>['body'];
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>['body'];
export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
