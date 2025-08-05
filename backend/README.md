# Board Papers API

A production-ready Express.js backend application that connects to Supabase using Prisma ORM for managing board papers and agenda items.

## 🚀 Features

- **Modern Architecture**: Clean monorepo-compatible folder structure
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Comprehensive input validation using Zod
- **Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Logging**: Morgan HTTP logging with environment-based configuration
- **Error Handling**: Robust error handling with custom error classes
- **Transactions**: Atomic operations for creating board papers with agenda items
- **Testing Ready**: Structured for easy testing and CI/CD integration
- **Modern Build Tool**: esbuild for fast, modern bundling

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── app.js       # App configuration
│   │   └── database.js  # Database connection
│   ├── controllers/      # Request handlers
│   │   └── boardPaperController.js
│   ├── middleware/       # Custom middleware
│   │   ├── cors.js      # CORS configuration
│   │   └── errorHandler.js # Error handling
│   ├── routes/          # Route definitions
│   │   └── boardPaperRoutes.js
│   ├── services/        # Business logic
│   │   └── boardPaperService.js
│   ├── utils/           # Helper functions
│   │   └── validation.js # Zod validation schemas
│   └── index.js         # Main application file
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Sample data seeding
├── package.json
├── .gitignore
├── env.example
└── README.md
```

## 🛠️ Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase or local)
- npm or yarn

## 📦 Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   PORT=3001
   NODE_ENV=development
   ```

4. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

6. **Seed the database with sample data:**
   ```bash
   npm run db:seed
   ```

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Development with Watch Mode
```bash
npm run build:watch
```

### Database Management
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Deploy migrations to production
npm run prisma:migrate:deploy

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run db:seed
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health
- **API Base**: http://localhost:3001/api

## 🔗 API Endpoints

### Board Papers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/board-papers` | Create a new board paper with agenda items |
| `GET` | `/api/board-papers` | Get all board papers (with filtering) |
| `GET` | `/api/board-papers/:id` | Get a specific board paper |
| `PUT` | `/api/board-papers/:id` | Update a board paper |
| `DELETE` | `/api/board-papers/:id` | Delete a board paper |
| `POST` | `/api/board-papers/:id/agenda-items` | Add agenda items to a board paper |

### Health & Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api-docs` | Swagger documentation |
| `GET` | `/` | API information |

## 📝 Example API Usage

### Create a Board Paper with Agenda Items

```bash
curl -X POST http://localhost:3001/api/board-papers \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q1 2025 Strategy Meeting",
    "description": "Strategic planning session for Q1 2025",
    "status": "DRAFT",
    "meetingDate": "2025-01-15T10:00:00Z",
    "agendaItems": [
      {
        "title": "Financial Review",
        "description": "Review of Q4 2024 financial performance",
        "order": 1,
        "duration": 30,
        "status": "PENDING"
      },
      {
        "title": "Strategic Planning",
        "description": "Q1 2025 strategic initiatives discussion",
        "order": 2,
        "duration": 45,
        "status": "PENDING"
      }
    ]
  }'
```

### Get All Board Papers

```bash
curl http://localhost:3001/api/board-papers
```

### Get Specific Board Paper

```bash
curl http://localhost:3001/api/board-papers/{id}
```

### Update Board Paper

```bash
curl -X PUT http://localhost:3001/api/board-papers/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "PUBLISHED"
  }'
```

## 🗄️ Database Schema

### Models

#### User
- `id` (String, Primary Key)
- `email` (String, Unique)
- `name` (String, Optional)
- `role` (UserRole Enum)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

#### BoardPaper
- `id` (String, Primary Key)
- `title` (String)
- `description` (String, Optional)
- `status` (BoardPaperStatus Enum)
- `meetingDate` (DateTime, Optional)
- `authorId` (String, Foreign Key to User)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

#### AgendaItem
- `id` (String, Primary Key)
- `title` (String)
- `description` (String, Optional)
- `order` (Integer)
- `duration` (Integer, Optional, minutes)
- `status` (AgendaItemStatus Enum)
- `boardPaperId` (String, Foreign Key to BoardPaper)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Enums

#### UserRole
- `ADMIN`
- `USER`
- `MODERATOR`

#### BoardPaperStatus
- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`
- `APPROVED`
- `REJECTED`

#### AgendaItemStatus
- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `DEFERRED`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SUPABASE_URL` | Supabase project URL | Optional |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Optional |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `LOG_LEVEL` | Logging level | `info` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `localhost:3000,3001` |

## 🧪 Testing

The application is structured for easy testing. You can add test files in a `tests/` directory:

```bash
# Example test structure
tests/
├── unit/
│   ├── services/
│   └── utils/
├── integration/
│   └── api/
└── e2e/
```

## 🚀 Deployment

### Docker (Recommended)

The project includes a `Dockerfile` optimized for production:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application with esbuild
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
```

### Environment Setup

1. Set up your PostgreSQL database (Supabase recommended)
2. Configure environment variables
3. Run migrations: `npm run prisma:migrate:deploy`
4. Start the application

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error responses
- **SQL Injection Protection**: Prisma ORM

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Custom Logging**: Structured error logging
- **Health Checks**: `/health` endpoint
- **Graceful Shutdown**: Proper cleanup on termination

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Check the API documentation at `/api-docs`
- Review the error logs
- Open an issue on GitHub

## 🔄 AI Copilot Integration

The application is structured to support AI copilot features:

- **Placeholder Hooks**: Ready for AI integration points
- **Structured Data**: Consistent API responses
- **Validation**: Robust input validation for AI-generated content
- **Transactions**: Atomic operations for AI-assisted content creation

### AI Copilot Features Ready

- Board paper creation with AI-generated agenda items
- Content suggestions and auto-completion
- Smart agenda item ordering
- Meeting duration optimization
- Template-based board paper generation 