import { Response, NextFunction } from 'express';
import { reminderService } from '../services/reminder.service.js';
import { sendSuccess, sendPaginated } from '../utils/helpers.js';
import { AuthenticatedRequest } from '../types/index.js';
import {
  CreateReminderInput,
  UpdateReminderInput,
  ListRemindersQuery,
} from '../validators/reminder.validator.js';

export class ReminderController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = req.body as CreateReminderInput;
      const reminder = await reminderService.create(userId, data);
      sendSuccess(res, reminder, 'Reminder created', 201);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const reminder = await reminderService.findById(id as string, userId);
      sendSuccess(res, reminder, 'Reminder retrieved');
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as ListRemindersQuery;

      const { reminders, total } = await reminderService.findAllByUser(userId, {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        relation: query.relation,
        month: query.month,
        upcoming: query.upcoming,
      });

      sendPaginated(res, reminders, total, query.page ?? 1, query.limit ?? 20);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data = req.body as UpdateReminderInput;
      const reminder = await reminderService.update(id as string, userId, data);
      sendSuccess(res, reminder, 'Reminder updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      await reminderService.delete(id as string, userId);
      sendSuccess(res, null, 'Reminder deleted');
    } catch (error) {
      next(error);
    }
  }

  async getUpcoming(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { reminders } = await reminderService.findAllByUser(userId, {
        upcoming: true,
        limit: 10,
      });
      sendSuccess(res, reminders, 'Upcoming birthdays retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const reminderController = new ReminderController();
