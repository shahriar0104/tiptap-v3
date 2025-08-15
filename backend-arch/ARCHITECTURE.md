# Backend Architecture Design

## Overview
This document outlines the architectural design and patterns used in the Board Meeting Management System backend. The architecture follows clean architecture principles with strict separation of concerns and dependency injection.

## Core Principles

### 1. Clean Architecture Layers
```
Controllers → Services → Models → Database
```

- **Controllers**: Handle HTTP requests/responses, input validation, and call services
- **Services**: Contain business logic, orchestrate operations, call models
- **Models**: Data access layer, contain only Prisma queries with validators
- **Database**: Prisma ORM with PostgreSQL

### 2. Dependency Injection
- No external DI libraries
- Constructor-based dependency injection
- Central container (`container.ts`) manages all dependencies
- Each layer has `index.ts` for clean exports

### 3. Strict TypeScript
- No `any` types allowed
- Comprehensive type definitions in `types/`
- Zod schemas for runtime validation
- Prisma validators for type-safe database queries

## Directory Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Prisma client setup
│   ├── supabase.ts   # Supabase client
│   ├── cors.ts       # CORS configuration
│   ├── cookies.ts    # Cookie configuration
│   └── swagger.ts    # OpenAPI documentation
├── controllers/      # HTTP request handlers
│   ├── authController.ts
│   ├── boardMeetingController.ts
│   ├── agendaController.ts
│   ├── uploadController.ts
│   ├── editorController.ts
│   ├── presentationController.ts
│   └── index.ts
├── services/         # Business logic layer
│   ├── authService.ts
│   ├── boardMeetingService.ts
│   ├── agendaService.ts
│   ├── uploadService.ts
│   ├── editorService.ts
│   ├── presentationService.ts
│   └── index.ts
├── models/           # Data access layer
│   ├── userModel.ts
│   ├── organizationModel.ts
│   ├── boardMeetingModel.ts
│   ├── agendaModel.ts
│   ├── uploadModel.ts
│   ├── editorContentModel.ts
│   ├── presentationModel.ts
│   └── index.ts
├── routes/           # API route definitions
│   ├── authRoutes.ts
│   ├── boardMeetingRoutes.ts
│   ├── agendaRoutes.ts
│   ├── uploadRoutes.ts
│   ├── editorRoutes.ts
│   ├── presentationRoutes.ts
│   └── index.ts
├── middlewares/      # Express middlewares
│   ├── authMiddleware.ts
│   ├── errorMiddleware.ts
│   ├── rateLimitMiddleware.ts
│   └── index.ts
├── validators/       # Zod validation schemas
│   ├── auth.ts
│   ├── boardMeeting.ts
│   ├── agenda.ts
│   ├── upload.ts
│   ├── editor.ts
│   └── presentation.ts
├── types/            # TypeScript type definitions
│   ├── index.ts
│   └── api.ts
├── utils/            # Utility functions
│   ├── errors.ts
│   └── response.ts
├── container.ts      # Dependency injection container
├── app.ts           # Express app setup
└── server.ts        # Server startup
```

## Data Models & Schema

### Core Entities

#### User
- **Purpose**: System users with Supabase auth integration
- **Key Fields**: `id` (UUID), `email`, `name`, `role`, `isActive`
- **Relationships**: OrgMember, BoardMember, Upload, BoardMeeting, Presentation

#### Organization
- **Purpose**: Multi-tenant organization structure
- **Key Fields**: `id` (UUID), `name`, `slug`, `description`, `domain`
- **Relationships**: OrgMember, BoardMeeting

#### OrgMember
- **Purpose**: User membership in organizations with roles
- **Key Fields**: `organizationId`, `userId`, `role` (OrgRole enum)
- **Roles**: OWNER, ADMIN, MEMBER, VIEWER

#### BoardMeeting
- **Purpose**: Board meeting entities with status management
- **Key Fields**: `id` (UUID), `title`, `status`, `meetingDate`, `organizationId`
- **Status**: DRAFT, PUBLISHED, ARCHIVED
- **Relationships**: BoardMember, AgendaGroup, Presentation, EditorContent

#### BoardMember
- **Purpose**: Meeting-specific user roles and permissions
- **Key Fields**: `boardMeetingId`, `userId`, `role` (BoardMemberRole enum)
- **Roles**: CHAIR, MEMBER, OBSERVER

### Content Entities

#### AgendaGroup
- **Purpose**: Logical grouping of agenda items
- **Key Fields**: `boardMeetingId`, `title`, `order`, `startTime`, `status`
- **Relationships**: AgendaItem

#### AgendaItem
- **Purpose**: Individual agenda items with documents
- **Key Fields**: `agendaGroupId`, `title`, `order`, `type`, `status`
- **Types**: STANDARD, DECISION, INFO
- **Status**: PENDING, IN_PROGRESS, COMPLETED
- **Relationships**: AgendaItemDocument, Slide

#### EditorContent
- **Purpose**: Versioned Tiptap JSON content for meetings
- **Key Fields**: `boardMeetingId`, `contentJson`, `version`
- **Features**: Automatic versioning, JSON storage

### File & Presentation Entities

#### Upload
- **Purpose**: File metadata and storage references
- **Key Fields**: `uploadedById`, `fileUrl`, `fileName`, `mimeType`
- **Relationships**: AgendaItemDocument

#### AgendaItemDocument
- **Purpose**: Link uploads to agenda items with roles
- **Key Fields**: `agendaItemId`, `uploadId`, `role` (DocumentRole enum)
- **Roles**: CONTEXT, FIGURE, APPENDIX

#### Presentation
- **Purpose**: Presentation containers for slides
- **Key Fields**: `boardMeetingId`, `createdById`
- **Relationships**: Slide

#### Slide
- **Purpose**: Individual presentation slides
- **Key Fields**: `presentationId`, `kind`, `title`, `bodyJson`, `orderIndex`
- **Kinds**: TITLE, SUMMARY, AGENDA_ITEM_SUMMARY, DETAIL
- **Features**: Optional agenda item linking, JSON content

## Authentication & Authorization

### Authentication Flow
1. **Supabase Integration**: Users authenticate via Supabase Auth
2. **HTTP-Only Cookies**: Access/refresh tokens stored securely
3. **Global Middleware**: Application-level auth middleware
4. **Token Refresh**: Automatic token refresh on expiration

### Authorization Levels

#### Organization Level (OrgRole)
- **OWNER**: Full organization control
- **ADMIN**: Administrative privileges
- **MEMBER**: Standard access
- **VIEWER**: Read-only access

#### Meeting Level (BoardMemberRole)
- **CHAIR**: Meeting leadership, full control
- **MEMBER**: Active participation
- **OBSERVER**: Read-only meeting access

### Public Routes
```typescript
[
  '/health',
  '/api-docs',
  '/api-docs/*',
  'POST:/api/auth/login',
  'POST:/api/auth/register',
  'POST:/api/auth/set-cookies',
  'POST:/api/auth/refresh',
  'POST:/api/auth/logout',
  'GET:/api/auth/google',
  'GET:/api/auth/google/callback',
  'POST:/api/auth/register-organization',
  'POST:/api/board-meetings/organization'
]
```

## Service Layer Patterns

### Business Logic Rules
1. **Authorization Checks**: Verify user permissions before operations
2. **Data Validation**: Validate input data using Zod schemas
3. **Transaction Safety**: Use Prisma transactions for multi-step operations
4. **Error Handling**: Throw custom error types for proper HTTP responses

### Model Layer Rules
1. **Pure Data Access**: Only Prisma queries, no business logic
2. **Prisma Validators**: Use for type-safe query building
3. **No Direct Service Calls**: Models don't call other models directly
4. **Consistent Patterns**: Standard CRUD operations across all models

## API Design Patterns

### REST Conventions
- **Resource-based URLs**: `/api/board-meetings/:id`
- **HTTP Methods**: GET, POST, PATCH, DELETE
- **Status Codes**: 200, 201, 400, 401, 403, 404, 500
- **Consistent Responses**: Standard success/error response format

### Query Parameters
- **Filtering**: `?status=PUBLISHED&organizationId=uuid`
- **Pagination**: `?page=1&limit=10`
- **Includes**: `?include=members,agendaGroups`
- **Sorting**: `?sortBy=meetingDate&order=desc`

### Request/Response Patterns
```typescript
// Standard Success Response
{
  success: true,
  message: "Operation successful",
  data: { ... }
}

// Standard Error Response
{
  success: false,
  message: "Error description",
  error: "ERROR_CODE"
}
```

## Module Structure

### Core Modules
1. **Auth**: User authentication and authorization
2. **Organization**: Multi-tenant organization management
3. **BoardMeeting**: Meeting lifecycle and status management
4. **Agenda**: Agenda groups and items with ordering

### Content Modules
5. **Upload**: File upload and document management
6. **Editor**: Tiptap content versioning and storage
7. **Presentation**: Slide-based presentations with agenda linking

### Each Module Contains
- **Model**: Data access with Prisma queries
- **Service**: Business logic and orchestration
- **Controller**: HTTP request handling
- **Routes**: API endpoint definitions
- **Validators**: Zod schemas for input validation
- **Types**: TypeScript interfaces and types

## Error Handling

### Custom Error Classes
```typescript
class UnauthorizedError extends Error
class ForbiddenError extends Error
class NotFoundError extends Error
class ValidationError extends Error
class ConflictError extends Error
```

### Error Middleware
- **Global Handler**: Catches all errors and formats responses
- **Prisma Error Translation**: Converts Prisma errors to HTTP errors
- **Validation Error Formatting**: Clear error messages for invalid input

## Testing Strategy

### Test Structure
```
tests/
├── unit/
│   ├── models/
│   ├── services/
│   └── controllers/
├── integration/
│   └── routes/
└── setup.js
```

### Testing Patterns
- **Unit Tests**: Models and services with mocking
- **Integration Tests**: Full request/response cycles
- **Database Tests**: In-memory or test database
- **Authentication Tests**: Token validation and authorization

## Performance Considerations

### Database Optimization
- **Proper Indexing**: UUID primary keys, foreign key indexes
- **Query Optimization**: Select only needed fields
- **Relationship Loading**: Efficient joins and includes
- **Connection Pooling**: Prisma connection management

### Caching Strategy
- **HTTP-Only Cookies**: Secure token storage
- **Response Caching**: Cache static content
- **Database Query Caching**: Prisma query caching

## Security Measures

### Authentication Security
- **HTTP-Only Cookies**: Prevent XSS attacks
- **Secure Cookies**: HTTPS-only in production
- **Token Rotation**: Automatic refresh token rotation
- **Session Management**: Proper logout and cleanup

### Authorization Security
- **Role-Based Access**: Multi-level permission system
- **Resource Ownership**: Users can only access their resources
- **Organization Scoping**: Data isolation by organization
- **Input Validation**: Comprehensive input sanitization

### General Security
- **CORS Configuration**: Restricted origins
- **Rate Limiting**: Prevent abuse
- **Helmet Middleware**: Security headers
- **Error Sanitization**: No sensitive data in error responses

## Deployment & Environment

### Environment Variables
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
NODE_ENV=production|development
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Production Considerations
- **Environment Separation**: Dev/staging/production
- **Database Migrations**: Automated schema updates
- **Health Checks**: `/health` endpoint for monitoring
- **Logging**: Structured logging with Morgan
- **Error Monitoring**: Comprehensive error tracking

This architecture ensures maintainable, scalable, and secure backend services while following industry best practices and clean architecture principles.
