// src/lib/stateStore.ts
// Version simplifiée : stockage 100% localStorage, pas d’API distante.

import { defaultPhases } from "@/data/crisisData";

// ===== Types ===============================================================

export interface AppState {
  meta: {
    title: string;
    mode: "real" | "exercise";
    severity: "Low" | "Modérée" | "Élevée" | "Critique";
    createdAt: string;
  };
  contacts: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
  }>;
  journal: Array<{
    id: string;
    at: string;
    category:
      | "incident"
      | "action"
      | "decision"
      | "communication"
      | "technical"
      | "legal"
      | "note";
    title: string;
    details: string;
  }>;
  actions: Array<{
    id: string;
    title: string;
    description: string;
    status: "todo" | "doing" | "done";
    owner: string;
    priority?: "low" | "med" | "high";
    dueAt: string | null;
    createdAt: string;
    updatedAt?: string;
    position: number;
  }>;
  decisions: Array<{
    id: string;
    title: string;
    rationale: string;
    owner?: string;
    decidedAt: string;
    status?:
      | "À initier"
      | "En cours"
      | "En pause"
      | "En retard"
      | "Bloqué"
      | "Terminé";
  }>;
  communications: Array<{
    id: string;
    audience: string;
    subject: string;
    message: string;
    sentAt: string;
  }>;
  phases: Array<{
    id: "P1" | "P2" | "P3" | "P4";
    title: string;
    strategic: Array<{
      id: string;
      text: string;
      checked: boolean;
      assignee: string | null;
      dueAt: string | null;
    }>;
    operational: Array<{
      id: string;
      text: string;
      checked: boolean;
      assignee: string | null;
      dueAt: string | null;
    }>;
  }>;
}

// ===== Session & état par défaut ==========================================

const SESSION_ID_KEY = "crisis_session_id";
const DEFAULT_SESSION_ID =
  (import.meta.env.VITE_DEFAULT_SESSION_ID as string | undefined) ||
  "crisis-session-001";

export function generateSessionId(): string {
  const globalCrypto =
    typeof window !== "undefined"
      ? window.crypto
      : typeof globalThis !== "undefined"
      ? (globalThis as any).crypto
      : undefined;

  if (globalCrypto && "randomUUID" in globalCrypto) {
    return (globalCrypto as Crypto).randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateSessionId(): string {
  let sessionId =
    DEFAULT_SESSION_ID || localStorage.getItem(SESSION_ID_KEY) || "";
  if (!sessionId) {
    sessionId = generateSessionId();
  }
  localStorage.setItem(SESSION_ID_KEY, sessionId);
  return sessionId;
}

export function getDefaultState(): AppState {
  return {
    meta: {
      title: "Nouvelle Session de Crise",
      mode: "exercise",
      severity: "Modérée",
      createdAt: new Date().toISOString(),
    },
    contacts: [],
    journal: [],
    actions: [],
    decisions: [],
    communications: [],
    phases: defaultPhases.map((p) => ({
      id: p.id as "P1" | "P2" | "P3" | "P4",
      title: `${p.title} - ${p.subtitle || ""}`.trim(),
      strategic: (p.checklist?.strategic || []).map((item) => ({
        id: item.id,
        text: item.text,
        checked: item.status === "done",
        assignee: null,
        dueAt: null,
      })),
      operational: (p.checklist?.operational || []).map((item) => ({
        id: item.id,
        text: item.text,
        checked: item.status === "done",
        assignee: null,
        dueAt: null,
      })),
    })),
  };
}

function sanitizeState(rawState?: Partial<AppState> | null): AppState {
  const fallback = getDefaultState();
  if (!rawState) return fallback;

  return {
    meta: {
      title: rawState.meta?.title || fallback.meta.title,
      mode: rawState.meta?.mode || fallback.meta.mode,
      severity: rawState.meta?.severity || fallback.meta.severity,
      createdAt: rawState.meta?.createdAt || fallback.meta.createdAt,
    },
    contacts: Array.isArray(rawState.contacts) ? rawState.contacts : [],
    journal: Array.isArray(rawState.journal) ? rawState.journal : [],
    actions: Array.isArray(rawState.actions) ? rawState.actions : [],
    decisions: Array.isArray(rawState.decisions) ? rawState.decisions : [],
    communications: Array.isArray(rawState.communications)
      ? rawState.communications
      : [],
    phases: Array.isArray(rawState.phases) ? rawState.phases : fallback.phases,
  };
}

// ===== LocalStorage simple ==================================================

function readLocalState(sessionId: string): AppState | null {
  try {
    const stored = localStorage.getItem(`crisis-state-${sessionId}`);
    return stored ? sanitizeState(JSON.parse(stored)) : null;
  } catch (err) {
    console.error("Error reading local state:", err);
    return null;
  }
}

function writeLocalState(sessionId: string, state: AppState) {
  try {
    const sanitized = sanitizeState(state);
    localStorage.setItem(
      `crisis-state-${sessionId}`,
      JSON.stringify(sanitized)
    );
  } catch (err) {
    console.error("Error writing local state:", err);
  }
}

// ===== API publique utilisée par le hook ===================================

export async function loadState(sessionId: string): Promise<AppState> {
  const local = readLocalState(sessionId);
  if (local) return local;

  const def = getDefaultState();
  writeLocalState(sessionId, def);
  return def;
}

export async function saveState(
  sessionId: string,
  state: AppState
): Promise<void> {
  writeLocalState(sessionId, state);
}

export async function deleteState(sessionId: string): Promise<void> {
  localStorage.removeItem(`crisis-state-${sessionId}`);
}

export async function resetSession(currentSessionId: string): Promise<string> {
  await deleteState(currentSessionId);
  const newSessionId = DEFAULT_SESSION_ID || generateSessionId();
  localStorage.setItem(SESSION_ID_KEY, newSessionId);
  return newSessionId;
}

export async function fetchRemoteSnapshot(
  sessionId: string
): Promise<AppState | null> {
  // version locale seulement => pas de remote
  return readLocalState(sessionId);
}

// Import JSON depuis fichier (gardé pour les exports / imports manuels)
export async function importJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        resolve(sanitizeState(raw));
      } catch (error) {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsText(file);
  });
}
