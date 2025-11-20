import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: process.env['NODE_ENV'] === 'production' ? jsonFormat : logFormat,
  }),
];

// Add file transports in production
if (process.env['NODE_ENV'] === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: jsonFormat,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      format: jsonFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transports,
  exitOnError: false,
});

// Create a stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};
