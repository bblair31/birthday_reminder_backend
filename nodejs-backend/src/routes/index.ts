import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import reminderRoutes from './reminder.routes.js';
import messageRoutes from './message.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/reminders', reminderRoutes);
router.use('/messages', messageRoutes);
router.use('/health', healthRoutes);

export default router;
