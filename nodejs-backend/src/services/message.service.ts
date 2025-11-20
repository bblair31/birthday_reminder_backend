import { Message } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class MessageService {
  async create(
    userId: string,
    data: {
      reminderId: string;
      content: string;
    }
  ): Promise<Message> {
    // Verify reminder belongs to user
    const reminder = await prisma.reminder.findUnique({
      where: { id: data.reminderId },
    });

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    if (reminder.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    // Check if message already exists for this reminder
    const existingMessage = await prisma.message.findUnique({
      where: { reminderId: data.reminderId },
    });

    if (existingMessage) {
      // Update existing message
      return this.update(existingMessage.id, userId, { content: data.content });
    }

    const message = await prisma.message.create({
      data: {
        reminderId: data.reminderId,
        content: data.content,
      },
    });

    logger.info(`Message created for reminder ${data.reminderId}`);

    return message;
  }

  async findById(id: string, userId: string): Promise<Message> {
    const message = await prisma.message.findUnique({
      where: { id },
      include: { reminder: true },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.reminder.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return message;
  }

  async findByReminderId(reminderId: string, userId: string): Promise<Message | null> {
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    if (reminder.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return prisma.message.findUnique({
      where: { reminderId },
    });
  }

  async update(
    id: string,
    userId: string,
    data: { content?: string }
  ): Promise<Message> {
    const message = await prisma.message.findUnique({
      where: { id },
      include: { reminder: true },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.reminder.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data,
    });

    logger.info(`Message updated: ${id}`);

    return updatedMessage;
  }

  async delete(id: string, userId: string): Promise<void> {
    const message = await prisma.message.findUnique({
      where: { id },
      include: { reminder: true },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.reminder.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    await prisma.message.delete({ where: { id } });

    logger.info(`Message deleted: ${id}`);
  }

  async findAllByUser(userId: string): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: {
        reminder: { userId },
      },
      include: {
        reminder: {
          select: { personName: true, relation: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return messages;
  }
}

export const messageService = new MessageService();
