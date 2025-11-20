import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { notificationService } from '../services/notification.service.js';

export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    const healthcheck = {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? '2.0.0',
    };

    res.status(200).json(healthcheck);
  }

  async detailed(_req: Request, res: Response): Promise<void> {
    const checks: Record<string, { status: string; message?: string; responseTime?: number }> = {};

    // Database check
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks['database'] = {
        status: 'ok',
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      checks['database'] = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // SMS service check
    checks['sms'] = {
      status: notificationService.isSMSConfigured() ? 'ok' : 'not_configured',
    };

    // Email service check
    checks['email'] = {
      status: notificationService.isEmailConfigured() ? 'ok' : 'not_configured',
    };

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const memoryStats = {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
    };

    const allHealthy = Object.values(checks).every(
      (check) => check.status === 'ok' || check.status === 'not_configured'
    );

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? '2.0.0',
      checks,
      memory: memoryStats,
    });
  }

  async ready(_req: Request, res: Response): Promise<void> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'not_ready' });
    }
  }
}

export const healthController = new HealthController();
