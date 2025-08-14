import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserData {
  id?: string; // For Supabase user ID
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  role?: 'ADMIN' | 'MEMBER' | undefined;
  organizationId?: string | undefined;
}

export interface CreateBoardMeetingData {
  title: string;
  description?: string | undefined;
  scheduledAt: Date;
  duration?: number | undefined;
  location?: string | undefined;
  organizationId: string;
}

export interface UpdateBoardMeetingData {
  title?: string | undefined;
  description?: string | undefined;
  scheduledAt?: Date | undefined;
  duration?: number | undefined;
  location?: string | undefined;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | undefined;
}

export interface CreateAgendaGroupData {
  title: string;
  description?: string | undefined;
  order: number;
  boardMeetingId: string;
}

export interface UpdateAgendaGroupData {
  title?: string | undefined;
  description?: string | undefined;
  order?: number | undefined;
}

export interface CreateAgendaItemData {
  title: string;
  description?: string | undefined;
  order: number;
  duration?: number | undefined;
  type?: 'DISCUSSION' | 'PRESENTATION' | 'DECISION' | 'INFORMATION' | undefined;
  agendaGroupId: string;
}

export interface UpdateAgendaItemData {
  title?: string | undefined;
  description?: string | undefined;
  order?: number | undefined;
  duration?: number | undefined;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | undefined;
  type?: 'DISCUSSION' | 'PRESENTATION' | 'DECISION' | 'INFORMATION' | undefined;
}

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
  };
}
