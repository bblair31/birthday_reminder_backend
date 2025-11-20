import { User } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { omitFields } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

type SafeUser = Omit<User, 'password' | 'passwordResetToken' | 'passwordResetExpires'>;

export class UserService {
  async findById(id: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return omitFields(user, ['password', 'passwordResetToken', 'passwordResetExpires']);
  }

  async findByEmail(email: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return null;
    }

    return omitFields(user, ['password', 'passwordResetToken', 'passwordResetExpires']);
  }

  async update(
    id: string,
    requesterId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      timezone?: string;
      preferredReminder?: 'SMS' | 'EMAIL' | 'BOTH';
    }
  ): Promise<SafeUser> {
    // Users can only update their own profile
    if (id !== requesterId) {
      throw new ForbiddenError('Cannot update other users');
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    logger.info(`User updated: ${updatedUser.email}`);

    return omitFields(updatedUser, ['password', 'passwordResetToken', 'passwordResetExpires']);
  }

  async delete(id: string, requesterId: string): Promise<void> {
    // Users can only delete their own account
    if (id !== requesterId) {
      throw new ForbiddenError('Cannot delete other users');
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Soft delete - deactivate account
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Delete all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: id },
    });

    logger.info(`User deleted (deactivated): ${user.email}`);
  }

  async getStats(userId: string): Promise<{
    totalReminders: number;
    upcomingBirthdays: number;
    notificationsSent: number;
  }> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [totalReminders, notificationsSent] = await Promise.all([
      prisma.reminder.count({ where: { userId } }),
      prisma.notificationLog.count({ where: { userId, status: 'SENT' } }),
    ]);

    // Count upcoming birthdays (within next 7 days)
    const reminders = await prisma.reminder.findMany({
      where: { userId },
      select: { birthday: true },
    });

    const upcomingBirthdays = reminders.filter((reminder) => {
      const birthday = new Date(reminder.birthday);
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
      );

      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }

      return thisYearBirthday >= today && thisYearBirthday <= nextWeek;
    }).length;

    return {
      totalReminders,
      upcomingBirthdays,
      notificationsSent,
    };
  }
}

export const userService = new UserService();
