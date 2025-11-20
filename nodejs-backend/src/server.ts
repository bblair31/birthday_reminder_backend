import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { schedulerService } from './services/scheduler.service.js';
import { logger } from './utils/logger.js';

const app = createApp();

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received, starting graceful shutdown...`);

  // Stop accepting new requests
  server.close(async () => {
    logger.info('HTTP server closed');

    // Stop scheduler
    schedulerService.stop();

    // Disconnect from database
    await disconnectDatabase();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(config.port, async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start scheduler
    if (!config.isTest) {
      schedulerService.start();
    }

    logger.info(`Server running on port ${config.port} in ${config.env} mode`);
    logger.info(`API Documentation: http://localhost:${config.port}/api-docs`);
    logger.info(`Health check: http://localhost:${config.port}/api/${config.apiVersion}/health`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
  process.exit(1);
});

export default server;
