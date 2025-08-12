export type ActionType = "Action" | "Approve" | "Noting";

export type AgendaItem = { id: string; time: string; title: string; action: ActionType };

export type AgendaGroup = { id: string; items: AgendaItem[] };

type UserRole = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'APPROVED' | 'REJECTED';

export type Organization = {
  id: string;
  name: string;
  description: string;
  domain: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
};