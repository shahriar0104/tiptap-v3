import { Request } from 'express';
import { 
  User as PrismaUser, 
  Organization as PrismaOrganization, 
  BoardMeeting as PrismaBoardMeeting,
  AgendaGroup as PrismaAgendaGroup,
  AgendaItem as PrismaAgendaItem,
  UserRole, 
  BoardMeetingStatus, 
  AgendaItemStatus 
} from '@prisma/client';

// Re-export Prisma enums
export { UserRole, BoardMeetingStatus, AgendaItemStatus };

// Use Prisma generated types as base types
export type Organization = PrismaOrganization;
export type User = PrismaUser;
export type BoardMeeting = PrismaBoardMeeting;
export type AgendaGroup = PrismaAgendaGroup;
export type AgendaItem = PrismaAgendaItem;

// Extended types with relations for complex queries
export type UserWithOrganization = PrismaUser & {
  organization: PrismaOrganization | null;
};

export type BoardMeetingWithDetails = PrismaBoardMeeting & {
  author: PrismaUser;
  organization: PrismaOrganization;
  agendaGroups: AgendaGroupWithItems[];
};

export type AgendaGroupWithItems = PrismaAgendaGroup & {
  agendaItems: PrismaAgendaItem[];
};

// Request Types for API
export interface CreateBoardMeetingRequest {
  title: string;
  description?: string;
  meetingDate?: string;
  status?: BoardMeetingStatus;
}

export interface UpdateBoardMeetingRequest {
  title?: string;
  description?: string;
  meetingDate?: string;
  status?: BoardMeetingStatus;
}

export interface CreateAgendaItemRequest {
  title: string;
  order: number;
  startTime: string;
  status?: AgendaItemStatus;
}

export interface UpdateAgendaItemRequest {
  title?: string;
  order?: number;
  startTime?: string;
  status?: AgendaItemStatus;
}

// Authentication Types
export type AuthenticatedUser = PrismaUser & {
  organization?: PrismaOrganization | null | undefined;
};

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// JWT Payload interface (keeping for compatibility)
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  iat?: number;
  exp?: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// Database Types
export interface DatabaseConfig {
  url: string;
  directUrl?: string;
  maxConnections?: number;
  connectionTimeout?: number;
}

// Supabase Types
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  jwtSecret: string;
}

// App Configuration Types
export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigins: string[];
  jwtSecret: string;
  jwtExpiresIn: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  cookieDomain?: string;
  frontendUrl: string;
  requestTimeout: number;
  logLevel: string;
}

// Cookie Types
export interface AuthCookies {
  accessToken: string;
  refreshToken: string;
}

// Service Response Types
export interface ServiceResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: Error;
}

// Additional service types
export interface OrganizationWithUsers extends Organization {
  users: User[];
}

export interface OrganizationWithBoardMeetings extends Organization {
  boardMeetings: BoardMeeting[];
}

// Organization Service Types
export interface OrganizationWithUsers extends Organization {
  users: User[];
}

export interface OrganizationWithBoardMeetings extends Organization {
  boardMeetings: BoardMeeting[];
}
