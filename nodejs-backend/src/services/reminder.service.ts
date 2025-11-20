import { Reminder, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { getDaysUntilBirthday, getNextBirthday, calculateAge } from '../utils/helpers.js';

export interface ReminderWithMessage extends Reminder {
  message?: { id: string; content: string } | null;
}

export interface EnrichedReminder extends ReminderWithMessage {
  age: number;
  daysUntil: number;
  nextBirthday: Date;
}

export class ReminderService {
  async create(
    userId: string,
    data: {
      personName: string;
      relation: string;
      birthday: string;
      phone?: string | null;
      email?: string | null;
      sendReminder?: boolean;
      daysBeforeReminder?: number;
      reminderMethod?: 'SMS' | 'EMAIL' | 'BOTH';
      notes?: string | null;
      message?: { content: string };
    }
  ): Promise<EnrichedReminder> {
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        personName: data.personName,
        relation: data.relation,
        birthday: new Date(data.birthday),
        phone: data.phone,
        email: data.email,
        sendReminder: data.sendReminder ?? true,
        daysBeforeReminder: data.daysBeforeReminder ?? 1,
        reminderMethod: data.reminderMethod ?? 'EMAIL',
        notes: data.notes,
        message: data.message
          ? {
              create: { content: data.message.content },
            }
          : undefined,
      },
      include: { message: true },
    });

    logger.info(`Reminder created: ${reminder.personName} for user ${userId}`);

    return this.enrichReminder(reminder);
  }

  async findById(id: string, userId: string): Promise<EnrichedReminder> {
    const reminder = await prisma.reminder.findUnique({
      where: { id },
      include: { message: true },
    });

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    if (reminder.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return this.enrichReminder(reminder);
  }

  async findAllByUser(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      relation?: string;
      month?: number;
      upcoming?: boolean;
    }
  ): Promise<{ reminders: EnrichedReminder[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'birthday',
      sortOrder = 'asc',
      relation,
      month,
      upcoming,
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.ReminderWhereInput = { userId };

    if (relation) {
      where.relation = { contains: relation, mode: 'insensitive' };
    }

    const [reminders, total] = await Promise.all([
      prisma.reminder.findMany({
        where,
        include: { message: true },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.reminder.count({ where }),
    ]);

    let enrichedReminders = reminders.map((r) => this.enrichReminder(r));

    // Filter by month if specified
    if (month !== undefined) {
      enrichedReminders = enrichedReminders.filter((r) => {
        const birthdayMonth = new Date(r.birthday).getMonth() + 1;
        return birthdayMonth === month;
      });
    }

    // Filter upcoming birthdays (next 30 days)
    if (upcoming) {
      enrichedReminders = enrichedReminders
        .filter((r) => r.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil);
    }

    return { reminders: enrichedReminders, total };
  }

  async update(
    id: string,
    userId: string,
    data: {
      personName?: string;
      relation?: string;
      birthday?: string;
      phone?: string | null;
      email?: string | null;
      sendReminder?: boolean;
      daysBeforeReminder?: number;
      reminderMethod?: 'SMS' | 'EMAIL' | 'BOTH';
      notes?: string | null;
      message?: { content: string };
    }
  ): Promise<EnrichedReminder> {
    const reminder = await prisma.reminder.findUnique({
      where: { id },
      include: { message: true },
    });

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    if (reminder.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    const updateData: Prisma.ReminderUpdateInput = {
      personName: data.personName,
      relation: data.relation,
      birthday: data.birthday ? new Date(data.birthday) : undefined,
      phone: data.phone,
      email: data.email,
      sendReminder: data.sendReminder,
      daysBeforeReminder: data.daysBeforeReminder,
      reminderMethod: data.reminderMethod,
      notes: data.notes,
    };

    // Handle message update/create
    if (data.message) {
      if (reminder.message) {
        updateData.message = {
          update: { content: data.message.content },
        };
      } else {
        updateData.message = {
          create: { content: data.message.content },
        };
      }
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id },
      data: updateData,
      include: { message: true },
    });

    logger.info(`Reminder updated: ${updatedReminder.personName}`);

    return this.enrichReminder(updatedReminder);
  }

  async delete(id: string, userId: string): Promise<void> {
    const reminder = await prisma.reminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    if (reminder.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    await prisma.reminder.delete({ where: { id } });

    logger.info(`Reminder deleted: ${reminder.personName}`);
  }

  async getUpcomingBirthdays(
    daysAhead: number = 1
  ): Promise<Array<ReminderWithMessage & { user: { id: string; firstName: string; lastName: string; email: string } }>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminders = await prisma.reminder.findMany({
      where: { sendReminder: true },
      include: {
        message: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return reminders.filter((reminder) => {
      const birthday = new Date(reminder.birthday);
      const nextBirthday = getNextBirthday(birthday);
      const daysUntil = getDaysUntilBirthday(birthday);

      return daysUntil === daysAhead;
    });
  }

  private enrichReminder(reminder: ReminderWithMessage): EnrichedReminder {
    const birthday = new Date(reminder.birthday);

    return {
      ...reminder,
      age: calculateAge(birthday),
      daysUntil: getDaysUntilBirthday(birthday),
      nextBirthday: getNextBirthday(birthday),
    };
  }
}

export const reminderService = new ReminderService();
