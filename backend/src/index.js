import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';

import {config} from './config/app.js';
import database from './config/database.js';
import {errorHandler, notFoundHandler} from './middleware/errorHandler.js';
import corsMiddleware, {corsErrorHandler} from './middleware/cors.js';
import secureByDefault from './middleware/secureByDefault.js';
import boardMeetingRoutes from './routes/boardMeetingRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Initialize Express app
const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Board Papers API',
      version: '1.0.0',
      description: 'A production-ready Express.js API for managing board papers and agenda items',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
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
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
}));

// CORS middleware
app.use(corsMiddleware);
app.use(corsErrorHandler);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Board Papers API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
  });
});

// Note: 404 and error handlers are moved to startServer() function after routes are mounted

// Graceful shutdown
let server;

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      await database.disconnect();
      console.log('Database disconnected');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.log('Forcing shutdown...');
      process.exit(1);
    }, 10000);
  } else {
    await database.disconnect();
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to database FIRST
    console.log('🚀 Starting server...');
    await database.connect();
    
    // Apply secure-by-default middleware to all API routes
    console.log('Applying secure-by-default authentication...');
    app.use('/api', secureByDefault);
    console.log('✅ Secure-by-default middleware applied');
    
    // Mount routes
    console.log('Mounting routes...');
    app.use('/api/board-meetings', boardMeetingRoutes);
    app.use('/api/auth', authRoutes);
    console.log('✅ Routes mounted successfully');
    
    // 404 handler (must be after routes)
    app.use(notFoundHandler);
    
    // Error handling middleware (must be last)
    app.use(errorHandler);
    
    // Start the server
    server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.port === 'string' ? 'Pipe ' + config.port : 'Port ' + config.port;

      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default app; 