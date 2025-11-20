import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('Password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      phone: '+11234567890',
      isEmailVerified: true,
      timezone: 'America/New_York',
      preferredReminder: 'EMAIL',
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create sample reminders
  const reminders = [
    {
      personName: 'Mom',
      relation: 'mother',
      birthday: new Date('1965-03-15'),
      phone: '+11234567891',
      email: 'mom@example.com',
      notes: 'Call in the morning',
      sendReminder: true,
      daysBeforeReminder: 3,
      reminderMethod: 'BOTH' as const,
    },
    {
      personName: 'Dad',
      relation: 'father',
      birthday: new Date('1963-07-22'),
      phone: '+11234567892',
      email: 'dad@example.com',
      sendReminder: true,
      daysBeforeReminder: 3,
      reminderMethod: 'EMAIL' as const,
    },
    {
      personName: 'Best Friend',
      relation: 'friend',
      birthday: new Date('1992-11-08'),
      phone: '+11234567893',
      email: 'friend@example.com',
      notes: 'Plan surprise party',
      sendReminder: true,
      daysBeforeReminder: 7,
      reminderMethod: 'SMS' as const,
    },
    {
      personName: 'Boss',
      relation: 'colleague',
      birthday: new Date('1975-01-30'),
      email: 'boss@company.com',
      notes: 'Send professional greeting',
      sendReminder: true,
      daysBeforeReminder: 1,
      reminderMethod: 'EMAIL' as const,
    },
    {
      personName: 'Spouse',
      relation: 'spouse',
      birthday: new Date('1990-09-12'),
      phone: '+11234567894',
      email: 'spouse@example.com',
      notes: 'Buy flowers and book restaurant',
      sendReminder: true,
      daysBeforeReminder: 14,
      reminderMethod: 'BOTH' as const,
    },
  ];

  for (const reminderData of reminders) {
    const reminder = await prisma.reminder.create({
      data: {
        userId: user.id,
        ...reminderData,
      },
    });

    // Create a message for some reminders
    if (['mother', 'spouse', 'friend'].includes(reminderData.relation)) {
      await prisma.message.create({
        data: {
          reminderId: reminder.id,
          content: `Happy Birthday ${reminderData.personName}! Wishing you all the love and happiness in the world!`,
        },
      });
    }

    console.log(`Created reminder: ${reminderData.personName}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
