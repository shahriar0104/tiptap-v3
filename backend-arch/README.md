# Backend Architecture - Production-Grade Express.js REST API

A production-ready TypeScript Express.js REST API with Prisma ORM, Supabase authentication, PostgreSQL, and clean separation of concerns.

## 🏗️ Architecture

This project follows a clean architecture pattern with strict separation of concerns:

- **Controllers** → Handle HTTP requests, call services, manage request/response lifecycle
- **Services** → Contain business logic, coordinate multiple models
- **Models** → Data access layer with Prisma queries only
- **Middlewares** → Authentication, validation, error handling
- **Validators** → Request validation using Zod
- **Utils** → Helper functions and utilities
- **Config** → Configuration files for database, auth, CORS, etc.

## 🚀 Features

- **TypeScript** with strict type checking (no `any` types)
- **Express.js** REST API with clean architecture
- **Prisma ORM** with PostgreSQL database
- **Supabase Authentication** with HTTP-only cookies
- **Zod validation** for all endpoints
- **Rate limiting** for security
- **CORS** configuration with credentials support
- **Helmet** for security headers
- **Morgan** logging
- **Jest** testing framework
- **ESLint + Prettier** for code quality
- **Graceful shutdown** handling

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # Prisma client
│   ├── supabase.ts  # Supabase client
│   ├── cors.ts      # CORS configuration
│   └── cookies.ts   # Cookie settings
├── controllers/     # HTTP request handlers
├── services/        # Business logic layer
├── models/          # Data access layer
├── middlewares/     # Authentication, validation, etc.
├── validators/      # Zod validation schemas
├── utils/           # Helper functions
├── routes/          # API route definitions
├── types/           # TypeScript type definitions
├── container.ts     # Dependency injection
├── app.ts           # Express app setup
└── server.ts        # Server startup
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **Testing**: Jest
- **Code Quality**: ESLint + Prettier

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL database (Supabase recommended)
- Supabase project for authentication

## ⚡ Quick Start

1. **Clone and install dependencies:**
   ```bash
   cd backend-arch
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   PORT=4000
   NODE_ENV=development
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   JWT_SECRET="your-super-secret-jwt-key"
   FRONTEND_URL="http://localhost:3000"
   COOKIE_SECRET="your-cookie-secret"
   ```

3. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the API:**
   - Health check: `http://localhost:4000/api/health`
   - API base URL: `http://localhost:4000/api`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/set-cookies` - Set authentication cookies
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/organization/users` - Get organization users

### Board Meetings
- `POST /api/board-meetings` - Create board meeting
- `GET /api/board-meetings` - Get board meetings (paginated)
- `GET /api/board-meetings/:id` - Get board meeting by ID
- `PUT /api/board-meetings/:id` - Update board meeting
- `DELETE /api/board-meetings/:id` - Delete board meeting
- `PATCH /api/board-meetings/:id/status` - Update meeting status

### Agenda Management
- `POST /api/agenda/groups` - Create agenda group
- `GET /api/agenda/groups/:id` - Get agenda group
- `PUT /api/agenda/groups/:id` - Update agenda group
- `DELETE /api/agenda/groups/:id` - Delete agenda group
- `POST /api/agenda/items` - Create agenda item
- `GET /api/agenda/items/:id` - Get agenda item
- `PUT /api/agenda/items/:id` - Update agenda item
- `DELETE /api/agenda/items/:id` - Delete agenda item
- `PATCH /api/agenda/items/:id/status` - Update item status

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🔧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Database Operations
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Build for Production
```bash
npm run build
npm start
```

## 🔒 Security Features

- **HTTP-only cookies** for authentication tokens
- **CORS** with explicit origin allowlist
- **Rate limiting** on authentication endpoints
- **Helmet** for security headers
- **Input validation** with Zod schemas
- **SQL injection protection** via Prisma
- **Graceful error handling** without exposing internals

## 🏢 Organization-Based Access Control

The API implements organization-based access control:
- Users belong to organizations
- Board meetings are scoped to organizations
- Users can only access data from their organization
- Admin users have elevated permissions within their organization

## 🔄 Status Management

### Board Meeting Status Flow
- `SCHEDULED` → `IN_PROGRESS` or `CANCELLED`
- `IN_PROGRESS` → `COMPLETED` or `CANCELLED`
- `CANCELLED` → `SCHEDULED` (reschedule)

### Agenda Item Status Flow
- `PENDING` → `IN_PROGRESS` or `DEFERRED`
- `IN_PROGRESS` → `COMPLETED`, `DEFERRED`, or `PENDING`
- `COMPLETED` → `PENDING` (reopen)
- `DEFERRED` → `PENDING` or `IN_PROGRESS`

## 📝 Contributing

1. Follow TypeScript strict mode (no `any` types)
2. Use Prisma validators in models
3. Implement proper error handling
4. Add tests for new features
5. Follow the established architecture patterns

## 📄 License

MIT License
