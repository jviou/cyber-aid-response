export type UUID = string;

export type Mode = "exercise" | "real";
export type Severity = "low" | "moderate" | "high" | "critical";
export type ActionPriority = "low" | "med" | "high";
export type ActionStatus = "todo" | "doing" | "done";
export type JournalCategory = "detection" | "containment" | "eradication" | "recovery" | "communication" | "decision" | "legal" | "incident" | "action" | "note";
export type ResourceKind = "file" | "link";

export interface Session {
  id: UUID;
  title: string;
  description?: string;
  mode: Mode;
  severity: Severity;
  created_by?: UUID;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: UUID;
  session_id: UUID;
  user_id?: UUID;
  display_name: string;
  role?: string;
  joined_at: string;
  presence?: any;
}

export interface JournalEvent {
  id: UUID;
  session_id: UUID;
  category: JournalCategory;
  title: string;
  details?: string;
  by_user?: string;
  attachments?: any[];
  at: string;
  updated_at: string;
  client_op_id?: string;
}

export interface ActionItem {
  id: UUID;
  session_id: UUID;
  title: string;
  description?: string;
  owner?: string;
  priority?: ActionPriority;
  status: ActionStatus;
  due_at?: string;
  created_at: string;
  updated_at: string;
  client_op_id?: string;
}

export interface Decision {
  id: UUID;
  session_id: UUID;
  question: string;
  option_chosen: string;
  rationale?: string;
  validator?: string;
  decided_at: string;
  tags?: string[];
  related_action_ids?: UUID[];
  related_journal_ids?: UUID[];
  updated_at: string;
  client_op_id?: string;
}

export interface Communication {
  id: UUID;
  session_id: UUID;
  audience: string;
  subject: string;
  message: string;
  author?: string;
  sent_at?: string;
  attachments?: any[];
  updated_at?: string;
  client_op_id?: string;
}

export interface Resource {
  id: UUID;
  session_id: UUID;
  kind: ResourceKind;
  title: string;
  url?: string;
  blob_key?: string;
  mime_type?: string;
  size_bytes?: number;
  tags?: string[];
  note?: string;
  added_at: string;
  added_by?: string;
  updated_at?: string;
  client_op_id?: string;
}

export interface AuditLog {
  id: UUID;
  session_id: UUID;
  entity: "journal" | "action" | "decision" | "comm" | "resource";
  entity_id: UUID;
  operation: "create" | "update" | "delete";
  before_data?: any;
  after_data?: any;
  by_user?: string;
  at: string;
}

// Categories mapping for French display
export const JOURNAL_CATEGORIES_FR: Record<JournalCategory, string> = {
  detection: "Détection",
  containment: "Confinement/Endiguement", 
  eradication: "Éradication",
  recovery: "Rétablissement",
  communication: "Communication",
  decision: "Décision",
  legal: "Juridique",
  incident: "Incident",
  action: "Action",
  note: "Note"
};