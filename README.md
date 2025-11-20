# Birthday Reminder API

A production-ready REST API for managing birthday reminders with SMS and email notifications.

**Modernized from Ruby on Rails to Node.js/TypeScript** for better type safety, modern tooling, and enhanced features.

## Repository Structure

```
birthday_reminder_backend/
├── nodejs-backend/     # Modern Node.js/TypeScript implementation (ACTIVE)
└── [Rails files]       # Original Ruby on Rails implementation (LEGACY)
```

## Current Implementation (Node.js)

The active backend is located in **`nodejs-backend/`** and built with modern technologies:

- **Node.js 20 LTS** - JavaScript runtime
- **TypeScript** - Full type safety
- **Express** - Web framework
- **Prisma** - Type-safe ORM with migrations
- **PostgreSQL** - Database
- **Twilio** - SMS notifications
- **Nodemailer** - Email notifications
- **JWT** - Authentication with refresh tokens

### Quick Start

```bash
cd nodejs-backend
npm install
cp .env.example .env  # Configure your environment
npm run docker:dev    # Start PostgreSQL & Redis
npm run prisma:migrate
npm run dev
```

**API Documentation**: http://localhost:3000/api-docs

See [`nodejs-backend/README.md`](./nodejs-backend/README.md) for detailed documentation.

## Key Features

### Core Functionality
- User registration and JWT authentication
- Birthday reminder CRUD operations
- Custom message templates per reminder
- SMS notifications via Twilio
- Email notifications via SMTP
- Automatic daily reminder scheduling (cron)

### Modern Engineering
- TypeScript with strict mode
- Input validation with Zod schemas
- OpenAPI/Swagger documentation
- Rate limiting per endpoint type
- Security headers with Helmet.js
- Structured logging with Winston
- Health check endpoints
- Graceful shutdown handling
- Docker containerization
- CI/CD pipeline with GitHub Actions
- Comprehensive test suite with Jest

## Environment Variables

**Important**: Never commit sensitive credentials to version control.

Required for the Node.js backend:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing key (minimum 32 characters)
- `JWT_REFRESH_SECRET` - Refresh token secret

For SMS notifications (Twilio):
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

See [`nodejs-backend/.env.example`](./nodejs-backend/.env.example) for all configuration options.

## API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh tokens |
| GET | `/api/v1/auth/me` | Get current user |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reminders` | List reminders |
| POST | `/api/v1/reminders` | Create reminder |
| GET | `/api/v1/reminders/upcoming` | Upcoming birthdays |
| PUT | `/api/v1/reminders/:id` | Update reminder |
| DELETE | `/api/v1/reminders/:id` | Delete reminder |

### Messages & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/messages` | Create message |
| POST | `/api/v1/messages/:id/send` | Send SMS/Email |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/health/detailed` | Detailed status |

Full API documentation available at `/api-docs` when running the server.

## Frontend

This backend is designed to work with a React frontend. The original frontend repository:
[Birthday Reminder Frontend](https://github.com/bblair31/birthday_reminder_front_end)

## Improvements Over Original Rails Version

| Feature | Rails (Original) | Node.js (New) |
|---------|------------------|---------------|
| Type Safety | Ruby (dynamic) | TypeScript (static) |
| Database ORM | ActiveRecord | Prisma (type-safe) |
| Validation | Rails validations | Zod schemas |
| Documentation | None | Swagger/OpenAPI |
| Scheduled Reminders | Not implemented | Cron-based daily |
| Email Notifications | Not implemented | Full SMTP support |
| Notification Logs | Not implemented | Full history |
| Rate Limiting | None | Per-endpoint limits |
| Security Headers | Basic CORS | Helmet.js suite |
| Refresh Tokens | Not implemented | Full rotation |
| Health Checks | None | Readiness/Liveness |
| Tests | None | Jest + Supertest |
| CI/CD | None | GitHub Actions |

## Legacy Rails Implementation

The original Ruby on Rails files remain in the root directory for reference. This implementation is no longer actively maintained. All new development should use the `nodejs-backend/` implementation.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contributors

* Original Rails version by [Shelby Scalia](https://github.com/srscalia)
* Node.js modernization - 2024

## License

This project is licensed under the MIT License.
