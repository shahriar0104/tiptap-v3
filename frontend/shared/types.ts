export type ActionType = "Action" | "Approve" | "Noting";
export type AgendaItem = { id: string; time: string; title: string; action: ActionType };
export type AgendaGroup = { id: string; items: AgendaItem[] };