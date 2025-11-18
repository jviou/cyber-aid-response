export type Mode = "exercise" | "real";
export type Severity = "low" | "moderate" | "high" | "critical";
export type TaskStatus = "todo" | "doing" | "done" | "n/a";
export type Priority = "low" | "medium" | "high";

export interface ChecklistItem {
  id: string;
  text: string;
  owner?: string;
  dueAt?: string;
  status: TaskStatus;
  evidence?: string[];
}

export interface Phase {
  id: "P1" | "P2" | "P3" | "P4";
  title: string;
  subtitle?: string;
  notes: string;
  checklist: {
    strategic: ChecklistItem[];
    operational: ChecklistItem[];
  };
  injects: Inject[];
}

export interface Inject {
  id: string;
  title: string;
  description?: string;
  plannedAt?: string;
  releasedAt?: string;
  attachments?: string[];
  phaseId?: Phase["id"];
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  owner?: string;
  priority: Priority;
  status: "todo" | "doing" | "done";
  dueAt?: string;
  createdAt: string;
  relatedInjectId?: string;
}

export interface Decision {
  id: string;
  question: string;
  optionChosen: string;
  rationale?: string;
  validator?: string;
  decidedAt: string;
  impacts?: string[];
}

export interface Communication {
  id: string;
  audience: "Interne" | "Direction" | "DPO" | "ANSSI" | "CERT" | "CNIL" | "Partenaires" | string;
  subject: string;
  message: string;
  author?: string;
  approvedBy?: string;
  sentAt?: string;
  attachments?: string[];
}

export interface JournalEvent {
  id: string;
  category: "detection" | "containment" | "eradication" | "recovery" | "communication" | "decision" | "legal" | string;
  title: string;
  details?: string;
  by?: string;
  attachments?: string[];
  at: string;
}

export interface Resource {
  id: string;
  title: string;
  url?: string;
  note?: string;
  tags?: string[];
}

export interface KeyContact {
  name: string;
  role: string;
  contact?: string;
}

export interface CrisisSession {
  id: string;
  mode: Mode;
  title: string;
  description: string;
  severity: Severity;
  createdAt: string;
  phases: Phase[];
  journal: JournalEvent[];
  actions: ActionItem[];
  decisions: Decision[];
  communications: Communication[];
  resources: Resource[];
  objectives?: string[];
  rules?: string[];
  keyContacts?: KeyContact[];
}
export interface Decision {
  id: string;
  title: string;
  decidedAt: string;          // ISO string
  rationale?: string;
  owner?: string;

  // Champs RIDA facultatifs (pour l’UI RIDA + Dashboard)
  kind?: "I" | "D" | "A";
  status?: "À initier" | "En cours" | "En pause" | "En retard" | "Bloqué" | "Terminé";
  dueDate?: string;           // "YYYY-MM-DD" si type A
}
