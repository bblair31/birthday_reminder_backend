import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { formatPhoneNumber } from '../utils/helpers.js';
import { ServiceUnavailableError } from '../utils/errors.js';

interface SendNotificationResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export class NotificationService {
  private twilioClient: twilio.Twilio | null = null;
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor() {
    // Initialize Twilio if configured
    if (config.twilio.accountSid && config.twilio.authToken) {
      this.twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
      logger.info('Twilio client initialized');
    } else {
      logger.warn('Twilio not configured - SMS notifications disabled');
    }

    // Initialize email transporter if configured
    if (config.email.host && config.email.user) {
      this.emailTransporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
      logger.info('Email transporter initialized');
    } else {
      logger.warn('Email not configured - email notifications disabled');
    }
  }

  async sendSMS(
    to: string,
    message: string,
    userId: string,
    reminderId: string
  ): Promise<SendNotificationResult> {
    if (!this.twilioClient || !config.twilio.phoneNumber) {
      throw new ServiceUnavailableError('SMS service not configured');
    }

    const formattedPhone = formatPhoneNumber(to);

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: config.twilio.phoneNumber,
        to: formattedPhone,
      });

      // Log notification
      await prisma.notificationLog.create({
        data: {
          userId,
          reminderId,
          method: 'SMS',
          status: 'SENT',
          externalId: result.sid,
          sentTo: formattedPhone,
          content: message,
        },
      });

      logger.info(`SMS sent to ${formattedPhone}, SID: ${result.sid}`);

      return {
        success: true,
        externalId: result.sid,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log failed notification
      await prisma.notificationLog.create({
        data: {
          userId,
          reminderId,
          method: 'SMS',
          status: 'FAILED',
          sentTo: formattedPhone,
          content: message,
          errorMessage,
        },
      });

      logger.error(`SMS failed to ${formattedPhone}: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string,
    userId: string,
    reminderId: string
  ): Promise<SendNotificationResult> {
    if (!this.emailTransporter || !config.email.from) {
      throw new ServiceUnavailableError('Email service not configured');
    }

    try {
      const result = await this.emailTransporter.sendMail({
        from: config.email.from,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      // Log notification
      await prisma.notificationLog.create({
        data: {
          userId,
          reminderId,
          method: 'EMAIL',
          status: 'SENT',
          externalId: result.messageId,
          sentTo: to,
          content: textContent,
        },
      });

      logger.info(`Email sent to ${to}, ID: ${result.messageId}`);

      return {
        success: true,
        externalId: result.messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log failed notification
      await prisma.notificationLog.create({
        data: {
          userId,
          reminderId,
          method: 'EMAIL',
          status: 'FAILED',
          sentTo: to,
          content: textContent,
          errorMessage,
        },
      });

      logger.error(`Email failed to ${to}: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async sendBirthdayReminder(
    userId: string,
    reminderId: string,
    personName: string,
    phone: string | null,
    email: string | null,
    customMessage: string | null,
    method: 'SMS' | 'EMAIL' | 'BOTH',
    senderName: string
  ): Promise<{ sms?: SendNotificationResult; email?: SendNotificationResult }> {
    const results: { sms?: SendNotificationResult; email?: SendNotificationResult } = {};

    const baseMessage = customMessage ?? `Happy Birthday to ${personName}!`;
    const fullMessage = `${baseMessage} --- From ${senderName}`;

    // Send SMS if enabled
    if ((method === 'SMS' || method === 'BOTH') && phone) {
      results.sms = await this.sendSMS(phone, fullMessage, userId, reminderId);
    }

    // Send Email if enabled
    if ((method === 'EMAIL' || method === 'BOTH') && email) {
      const subject = `Birthday Reminder: ${personName}`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff6b6b;">🎂 Birthday Reminder!</h1>
          <p style="font-size: 18px;">${baseMessage}</p>
          <p style="color: #666;">--- From ${senderName}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            This is an automated reminder from Birthday Reminder App.
          </p>
        </div>
      `;

      results.email = await this.sendEmail(
        email,
        subject,
        htmlContent,
        fullMessage,
        userId,
        reminderId
      );
    }

    return results;
  }

  async getNotificationHistory(
    userId: string,
    limit: number = 50
  ): Promise<typeof prisma.notificationLog.findMany> {
    return prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: limit,
      include: {
        reminder: {
          select: { personName: true },
        },
      },
    });
  }

  isSMSConfigured(): boolean {
    return this.twilioClient !== null && Boolean(config.twilio.phoneNumber);
  }

  isEmailConfigured(): boolean {
    return this.emailTransporter !== null;
  }
}

export const notificationService = new NotificationService();
