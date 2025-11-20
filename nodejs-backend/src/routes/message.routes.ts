import { Router } from 'express';
import { messageController } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { smsLimiter } from '../middleware/rateLimiter.js';
import {
  createMessageSchema,
  updateMessageSchema,
  getMessageSchema,
  sendMessageSchema,
} from '../validators/message.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: List all messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', messageController.list.bind(messageController));

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Create a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessageInput'
 */
router.post(
  '/',
  validate(createMessageSchema),
  messageController.create.bind(messageController)
);

/**
 * @swagger
 * /messages/{id}:
 *   get:
 *     summary: Get message by ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  validate(getMessageSchema),
  messageController.getById.bind(messageController)
);

/**
 * @swagger
 * /messages/{id}:
 *   put:
 *     summary: Update message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  validate(updateMessageSchema),
  messageController.update.bind(messageController)
);

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     summary: Delete message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  validate(getMessageSchema),
  messageController.delete.bind(messageController)
);

/**
 * @swagger
 * /messages/{id}/send:
 *   post:
 *     summary: Send message via SMS/Email
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/send',
  smsLimiter,
  validate(sendMessageSchema),
  messageController.send.bind(messageController)
);

export default router;
