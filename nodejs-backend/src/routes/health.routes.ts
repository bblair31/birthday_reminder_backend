import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 */
router.get('/', healthController.check.bind(healthController));

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     tags: [Health]
 */
router.get('/detailed', healthController.detailed.bind(healthController));

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check
 *     tags: [Health]
 */
router.get('/ready', healthController.ready.bind(healthController));

export default router;
