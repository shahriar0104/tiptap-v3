import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Board Meeting Management API',
    version: '1.0.0',
    description: 'Production-grade Express.js REST API for board meeting management with TypeScript, Prisma, and Supabase Auth',
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
      url: process.env.FRONTEND_URL || 'http://localhost:4000',
      description: 'Development server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'sb_access_token',
        description: 'HTTP-only cookie containing the access token',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful',
          },
          data: {
            type: 'object',
            description: 'Response data (varies by endpoint)',
          },
          message: {
            type: 'string',
            description: 'Success message',
          },
          error: {
            type: 'string',
            description: 'Error message (only present when success is false)',
          },
        },
        required: ['success'],
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: {
                    type: 'integer',
                    example: 1,
                  },
                  limit: {
                    type: 'integer',
                    example: 10,
                  },
                  total: {
                    type: 'integer',
                    example: 100,
                  },
                  totalPages: {
                    type: 'integer',
                    example: 10,
                  },
                },
              },
            },
          },
          message: {
            type: 'string',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          firstName: {
            type: 'string',
            example: 'John',
            nullable: true,
          },
          lastName: {
            type: 'string',
            example: 'Doe',
            nullable: true,
          },
          role: {
            type: 'string',
            enum: ['ADMIN', 'USER'],
            example: 'USER',
          },
          organizationId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:00:00Z',
          },
        },
      },
      BoardMeeting: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          title: {
            type: 'string',
            example: 'Q4 Board Meeting',
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Quarterly review and planning session',
          },
          scheduledAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-15T14:00:00Z',
          },
          duration: {
            type: 'integer',
            nullable: true,
            example: 120,
            description: 'Duration in minutes',
          },
          location: {
            type: 'string',
            nullable: true,
            example: 'Conference Room A',
          },
          status: {
            type: 'string',
            enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            example: 'SCHEDULED',
          },
          organizationId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          createdById: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:00:00Z',
          },
        },
      },
      AgendaGroup: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          title: {
            type: 'string',
            example: 'Financial Review',
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Review of Q4 financial performance',
          },
          order: {
            type: 'integer',
            example: 0,
          },
          boardMeetingId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          createdById: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:00:00Z',
          },
        },
      },
      AgendaItem: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          title: {
            type: 'string',
            example: 'Revenue Analysis',
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Detailed analysis of Q4 revenue streams',
          },
          order: {
            type: 'integer',
            example: 0,
          },
          duration: {
            type: 'integer',
            nullable: true,
            example: 30,
            description: 'Duration in minutes',
          },
          type: {
            type: 'string',
            enum: ['DISCUSSION', 'PRESENTATION', 'DECISION', 'INFORMATION'],
            example: 'PRESENTATION',
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED'],
            example: 'PENDING',
          },
          agendaGroupId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          createdById: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-01T10:00:00Z',
          },
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);
