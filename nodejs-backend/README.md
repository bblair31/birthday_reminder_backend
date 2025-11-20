# Birthday Reminder API

A modern, production-ready REST API for managing birthday reminders with SMS and email notifications.

Built with **Node.js 20 LTS**, **TypeScript**, **Express**, **Prisma**, and **PostgreSQL**.

## Features

### Core Features
- **User Authentication** - JWT-based auth with access & refresh tokens
- **Birthday Reminders** - Full CRUD operations for birthday reminders
- **Custom Messages** - Personalized message templates for each reminder
- **SMS Notifications** - Twilio integration for SMS reminders
- **Email Notifications** - SMTP support for email reminders
- **Automatic Scheduling** - Cron-based daily reminder checks

### Modern Engineering Practices
- **TypeScript** - Full type safety across the codebase
- **Prisma ORM** - Type-safe database queries with migrations
- **Input Validation** - Zod schema validation on all endpoints
- **API Documentation** - Interactive Swagger/OpenAPI docs
- **Rate Limiting** - Protection against abuse
- **Security Headers** - Helmet.js for HTTP security
- **Structured Logging** - Winston with JSON format for production
- **Health Checks** - Readiness and liveness probes
- **Graceful Shutdown** - Clean shutdown handling
- **Docker Support** - Production-ready containerization
- **CI/CD Pipeline** - GitHub Actions for testing and deployment
- **Comprehensive Tests** - Unit and integration tests with Jest

## Quick Start

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   cd nodejs-backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL** (using Docker)
   ```bash
   npm run docker:dev
   ```

4. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Seed the database** (optional)
   ```bash
   npm run prisma:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

API Documentation: `http://localhost:3000/api-docs`

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Server port | No | 3000 |
| `DATABASE_URL` | PostgreSQL connection URL | Yes | - |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes | - |
| `JWT_EXPIRES_IN` | Access token expiry | No | 7d |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | No | 30d |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | No* | - |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | No* | - |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | No* | - |
| `SMTP_HOST` | SMTP server host | No* | - |
| `SMTP_PORT` | SMTP server port | No* | 587 |
| `SMTP_USER` | SMTP username | No* | - |
| `SMTP_PASS` | SMTP password | No* | - |
| `EMAIL_FROM` | Default from address | No* | - |
| `CORS_ORIGIN` | Allowed CORS origins | No | * |
| `REMINDER_DAYS_BEFORE` | Days before birthday to send reminder | No | 1 |
| `REMINDER_CRON_SCHEDULE` | Cron schedule for reminders | No | 0 8 * * * |

*Required for notification features

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout user |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| POST | `/api/v1/auth/change-password` | Change password |
| GET | `/api/v1/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/profile` | Get user profile |
| GET | `/api/v1/users/stats` | Get user statistics |
| GET | `/api/v1/users/:id` | Get user by ID |
| PUT | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reminders` | List all reminders |
| GET | `/api/v1/reminders/upcoming` | Get upcoming birthdays |
| POST | `/api/v1/reminders` | Create reminder |
| GET | `/api/v1/reminders/:id` | Get reminder by ID |
| PUT | `/api/v1/reminders/:id` | Update reminder |
| DELETE | `/api/v1/reminders/:id` | Delete reminder |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/messages` | List all messages |
| POST | `/api/v1/messages` | Create message |
| GET | `/api/v1/messages/:id` | Get message by ID |
| PUT | `/api/v1/messages/:id` | Update message |
| DELETE | `/api/v1/messages/:id` | Delete message |
| POST | `/api/v1/messages/:id/send` | Send message via SMS/Email |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Basic health check |
| GET | `/api/v1/health/detailed` | Detailed health check |
| GET | `/api/v1/health/ready` | Readiness probe |

## Project Structure

```
nodejs-backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── config/            # Configuration
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Express middleware
│   ├── routes/            # Route definitions
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   ├── utils/             # Utilities
│   ├── validators/        # Zod schemas
│   ├── app.ts             # Express app
│   └── server.ts          # Server entry
├── tests/
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── .github/
│   └── workflows/         # CI/CD workflows
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database

# Testing
npm test                 # Run tests with coverage
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier

# Docker
npm run docker:dev       # Start dev dependencies
npm run docker:prod      # Start production stack
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests in watch mode
npm run test:watch
```

## Docker Deployment

### Development
```bash
# Start PostgreSQL and Redis
npm run docker:dev

# Run application
npm run dev
```

### Production
```bash
# Set environment variables
export JWT_SECRET=your-production-secret
export JWT_REFRESH_SECRET=your-refresh-secret

# Build and start all services
docker-compose up -d

# Run migrations
docker-compose exec api npx prisma migrate deploy
```

## Security Considerations

1. **Environment Variables** - Never commit `.env` files. Use `.env.example` as template.
2. **Twilio Credentials** - Keep `TWILIO_AUTH_TOKEN` secret and rotate regularly.
3. **JWT Secrets** - Use strong, random secrets (min 32 characters).
4. **Database** - Use strong passwords and restrict network access.
5. **CORS** - Configure specific origins in production.
6. **Rate Limiting** - Adjust limits based on your needs.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Improvements Over Original Rails Version

### Architecture
- **TypeScript** instead of Ruby for better type safety
- **Prisma ORM** instead of ActiveRecord for type-safe queries
- **Zod validation** instead of Rails validations for runtime safety
- **Service layer** architecture for better separation of concerns

### Features Added
- **Automatic scheduled reminders** (missing in Rails version)
- **Email notifications** in addition to SMS
- **Notification history/logs**
- **User statistics dashboard**
- **Password reset flow**
- **Refresh token rotation**
- **Rate limiting per endpoint type**
- **Health check endpoints** for monitoring
- **Graceful shutdown** handling

### Security Improvements
- **Strong password requirements** with regex validation
- **Account deactivation** (soft delete)
- **Token expiration** and rotation
- **Stricter CORS** configuration options
- **Helmet.js** security headers

### Developer Experience
- **Swagger/OpenAPI documentation**
- **Comprehensive test suite**
- **Docker development environment**
- **CI/CD pipeline**
- **TypeScript path aliases**
- **ESLint + Prettier** for consistent code style
