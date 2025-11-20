import { Router } from 'express';
import { reminderController } from '../controllers/reminder.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createReminderSchema,
  updateReminderSchema,
  getReminderSchema,
  listRemindersSchema,
} from '../validators/reminder.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /reminders:
 *   get:
 *     summary: List all reminders
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: relation
 *         schema:
 *           type: string
 *         description: Filter by relation
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Filter by birth month (1-12)
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Show only upcoming birthdays
 */
router.get(
  '/',
  validate(listRemindersSchema),
  reminderController.list.bind(reminderController)
);

/**
 * @swagger
 * /reminders/upcoming:
 *   get:
 *     summary: Get upcoming birthdays (next 30 days)
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/upcoming', reminderController.getUpcoming.bind(reminderController));

/**
 * @swagger
 * /reminders:
 *   post:
 *     summary: Create a new reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReminderInput'
 */
router.post(
  '/',
  validate(createReminderSchema),
  reminderController.create.bind(reminderController)
);

/**
 * @swagger
 * /reminders/{id}:
 *   get:
 *     summary: Get reminder by ID
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  validate(getReminderSchema),
  reminderController.getById.bind(reminderController)
);

/**
 * @swagger
 * /reminders/{id}:
 *   put:
 *     summary: Update reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  validate(updateReminderSchema),
  reminderController.update.bind(reminderController)
);

/**
 * @swagger
 * /reminders/{id}:
 *   delete:
 *     summary: Delete reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  validate(getReminderSchema),
  reminderController.delete.bind(reminderController)
);

export default router;
