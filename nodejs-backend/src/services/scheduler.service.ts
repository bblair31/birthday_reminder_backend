import cron from 'node-cron';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { reminderService } from './reminder.service.js';
import { notificationService } from './notification.service.js';

export class SchedulerService {
  private jobs: cron.ScheduledTask[] = [];

  start(): void {
    // Schedule daily birthday reminder check
    const reminderJob = cron.schedule(
      config.reminder.cronSchedule,
      () => {
        this.sendDailyReminders().catch((error) => {
          logger.error('Failed to send daily reminders:', error);
        });
      },
      {
        timezone: 'America/New_York',
      }
    );

    this.jobs.push(reminderJob);
    logger.info(`Scheduler started: Daily reminders at ${config.reminder.cronSchedule}`);

    // Schedule cleanup of old refresh tokens (every day at 3 AM)
    const cleanupJob = cron.schedule(
      '0 3 * * *',
      () => {
        this.cleanupExpiredTokens().catch((error) => {
          logger.error('Failed to cleanup expired tokens:', error);
        });
      },
      {
        timezone: 'America/New_York',
      }
    );

    this.jobs.push(cleanupJob);
    logger.info('Scheduler started: Token cleanup at 3 AM daily');
  }

  stop(): void {
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
    logger.info('Scheduler stopped');
  }

  async sendDailyReminders(): Promise<void> {
    logger.info('Starting daily birthday reminder check...');

    try {
      // Get reminders for birthdays happening in X days
      const upcomingReminders = await reminderService.getUpcomingBirthdays(
        config.reminder.daysBefore
      );

      logger.info(`Found ${upcomingReminders.length} upcoming birthdays`);

      for (const reminder of upcomingReminders) {
        try {
          const senderName = `${reminder.user.firstName} ${reminder.user.lastName}`;
          const customMessage = reminder.message?.content ?? null;

          await notificationService.sendBirthdayReminder(
            reminder.userId,
            reminder.id,
            reminder.personName,
            reminder.phone,
            reminder.email ?? reminder.user.email, // Use user's email if no specific email
            customMessage,
            reminder.reminderMethod,
            senderName
          );

          logger.info(`Reminder sent for ${reminder.personName} to ${senderName}`);
        } catch (error) {
          logger.error(`Failed to send reminder for ${reminder.personName}:`, error);
        }
      }

      logger.info('Daily birthday reminder check completed');
    } catch (error) {
      logger.error('Daily reminder check failed:', error);
      throw error;
    }
  }

  private async cleanupExpiredTokens(): Promise<void> {
    const { prisma } = await import('../config/database.js');

    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    logger.info(`Cleaned up ${result.count} expired refresh tokens`);
  }

  // Manual trigger for testing
  async triggerReminders(): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    const upcomingReminders = await reminderService.getUpcomingBirthdays(
      config.reminder.daysBefore
    );

    for (const reminder of upcomingReminders) {
      try {
        const senderName = `${reminder.user.firstName} ${reminder.user.lastName}`;
        const customMessage = reminder.message?.content ?? null;

        await notificationService.sendBirthdayReminder(
          reminder.userId,
          reminder.id,
          reminder.personName,
          reminder.phone,
          reminder.email ?? reminder.user.email,
          customMessage,
          reminder.reminderMethod,
          senderName
        );

        sent++;
      } catch {
        failed++;
      }
    }

    return { sent, failed };
  }
}

export const schedulerService = new SchedulerService();
