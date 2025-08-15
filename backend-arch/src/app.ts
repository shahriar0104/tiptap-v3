import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { corsConfig } from './config/cors';
import { swaggerSpec } from './config/swagger';
import { generalRateLimit } from './middlewares/rateLimitMiddleware';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware';
import { container } from './container';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(corsConfig));

// Rate limiting
app.use(generalRateLimit);

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Global authentication middleware (handles public/protected routes automatically)
app.use(container.authMiddleware.authenticate);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Board Meeting API Documentation',
}));

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
