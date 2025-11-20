import { Response, NextFunction } from 'express';
import { messageService } from '../services/message.service.js';
import { notificationService } from '../services/notification.service.js';
import { reminderService } from '../services/reminder.service.js';
import { sendSuccess } from '../utils/helpers.js';
import { AuthenticatedRequest } from '../types/index.js';
import {
  CreateMessageInput,
  UpdateMessageInput,
  SendMessageInput,
} from '../validators/message.validator.js';

export class MessageController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = req.body as CreateMessageInput;
      const message = await messageService.create(userId, data);
      sendSuccess(res, message, 'Message created', 201);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const message = await messageService.findById(id as string, userId);
      sendSuccess(res, message, 'Message retrieved');
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const messages = await messageService.findAllByUser(userId);
      sendSuccess(res, messages, 'Messages retrieved');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data = req.body as UpdateMessageInput;
      const message = await messageService.update(id as string, userId, data);
      sendSuccess(res, message, 'Message updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      await messageService.delete(id as string, userId);
      sendSuccess(res, null, 'Message deleted');
    } catch (error) {
      next(error);
    }
  }

  async send(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const user = req.user!;
      const { method } = req.body as SendMessageInput;

      // Get message and its associated reminder
      const message = await messageService.findById(id as string, userId);
      const reminder = await reminderService.findById(message.reminderId, userId);

      const senderName = `${user.firstName} ${user.lastName}`;

      const result = await notificationService.sendBirthdayReminder(
        userId,
        reminder.id,
        reminder.personName,
        reminder.phone,
        reminder.email,
        message.content,
        method ?? reminder.reminderMethod,
        senderName
      );

      sendSuccess(res, result, 'Message sent');
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
