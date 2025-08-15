import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthenticatedUser extends User {
  organizationId?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
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
  };
}

export interface CreateUserData {
  id?: string; // For Supabase user ID
  email: string;
  name?: string | undefined;
  avatar?: string | undefined;
  role?: 'ADMIN' | 'MEMBER' | undefined;
}

export interface CreateBoardMeetingData {
  title: string;
  description?: string | undefined;
  meetingDate?: Date | undefined;
  organizationId: string;
}

export interface UpdateBoardMeetingData {
  title?: string | undefined;
  description?: string | undefined;
  meetingDate?: Date | undefined;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | undefined;
  order?: number | undefined;
}

export interface CreateAgendaGroupData {
  title: string;
  order: number;
  startTime: Date;
  boardMeetingId: string;
}

export interface UpdateAgendaGroupData {
  title?: string | undefined;
  order?: number | undefined;
  startTime?: Date | undefined;
}

export interface CreateAgendaItemData {
  title: string;
  order: number;
  startTime: Date;
  type?: 'STANDARD' | 'DECISION' | 'INFO' | undefined;
  agendaGroupId: string;
}

export interface UpdateAgendaItemData {
  title?: string | undefined;
  order?: number | undefined;
  startTime?: Date | undefined;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | undefined;
  type?: 'STANDARD' | 'DECISION' | 'INFO' | undefined;
}

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    firstName?: string;
    lastName?: string;
  };
}

// Upload types
export interface CreateUploadData {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  uploadedById?: string;
}

export interface UpdateUploadData {
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
}

// EditorContent types
export interface CreateEditorContentData {
  boardMeetingId: string;
  contentJson: any; // Tiptap JSON content
  version?: number;
}

export interface UpdateEditorContentData {
  contentJson?: any;
  version?: number;
}

// Presentation types
export interface CreatePresentationData {
  boardMeetingId: string;
  createdById?: string;
}

export interface UpdatePresentationData {
  // Currently no updatable fields, but keeping for future extensibility
}

// Slide types
export interface CreateSlideData {
  presentationId: string;
  agendaItemId?: string;
  kind: 'TITLE' | 'SUMMARY' | 'AGENDA_ITEM_SUMMARY' | 'DETAIL';
  title?: string;
  bodyJson?: any;
  orderIndex: number;
}

export interface UpdateSlideData {
  kind?: 'TITLE' | 'SUMMARY' | 'AGENDA_ITEM_SUMMARY' | 'DETAIL';
  title?: string;
  bodyJson?: any;
  orderIndex?: number;
  agendaItemId?: string | null;
}
