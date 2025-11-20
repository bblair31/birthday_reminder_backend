import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Birthday Reminder API',
      version: '2.0.0',
      description: `
A modern, production-ready API for managing birthday reminders with SMS and email notifications.

## Features
- User authentication with JWT
- Birthday reminder management
- Custom message templates
- SMS notifications via Twilio
- Email notifications
- Automatic scheduled reminders

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
\`Authorization: Bearer <access_token>\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            timezone: { type: 'string' },
            preferredReminder: { type: 'string', enum: ['SMS', 'EMAIL', 'BOTH'] },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        CreateReminderInput: {
          type: 'object',
          required: ['personName', 'relation', 'birthday'],
          properties: {
            personName: { type: 'string' },
            relation: { type: 'string' },
            birthday: { type: 'string', format: 'date' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            sendReminder: { type: 'boolean', default: true },
            daysBeforeReminder: { type: 'integer', default: 1 },
            reminderMethod: { type: 'string', enum: ['SMS', 'EMAIL', 'BOTH'] },
            notes: { type: 'string' },
            message: {
              type: 'object',
              properties: {
                content: { type: 'string', maxLength: 500 },
              },
            },
          },
        },
        CreateMessageInput: {
          type: 'object',
          required: ['reminderId', 'content'],
          properties: {
            reminderId: { type: 'string', format: 'uuid' },
            content: { type: 'string', maxLength: 500 },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Reminders', description: 'Birthday reminder management' },
      { name: 'Messages', description: 'Message templates and sending' },
      { name: 'Health', description: 'Health check endpoints' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
