import { defaultPhases } from "@/data/crisisData";

// ----------------- TYPE DEFINITIONS -----------------

export interface AppState {
  meta: {
    title: string;
    mode: "real" | "exercise";
    severity: "Low" | "Modérée" | "Élevée" | "Critique";
    version?: number;
    createdAt: string;
    updatedAt: string;
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
    checklist: {
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
    };
    injects?: Array<any>;
  }>;
}

// ----------------- HELPERS -----------------

// Polyfill for randomUUID to prevent crashes in non-secure contexts (HTTP)
export function generateSessionId(): string {
  // Use crypto.randomUUID if available (Secure Context)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for non-secure contexts (HTTP)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getOrCreateSessionId(): string {
  const SESSION_ID_KEY = "crisis_session_id";
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// ----------------- DEFAULT STATE -----------------

export function getDefaultState(): AppState {
  const now = new Date().toISOString();
  return {
    meta: {
      title: "Nouvelle Session de Crise",
      mode: "exercise",
      severity: "Modérée",
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
    contacts: [],
    journal: [],
    actions: [],
    decisions: [],
    communications: [],
    phases: defaultPhases.map((p) => ({
      id: p.id as "P1" | "P2" | "P3" | "P4",
      title: `${p.title} - ${p.subtitle || ""}`.trim(),
      checklist: {
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
      },
      injects: []
    })),
  };
}

// ----------------- NORMALIZATION (Bulletproof) -----------------

export function normalizeAppState(rawState?: any): AppState {
  const fallback = getDefaultState();
  if (!rawState) return fallback;

  // Deep merge / Validation
  return {
    meta: {
      title: rawState.meta?.title || fallback.meta.title,
      mode: rawState.meta?.mode || fallback.meta.mode,
      severity: rawState.meta?.severity || fallback.meta.severity,
      version: rawState.meta?.version || 1,
      createdAt: rawState.meta?.createdAt || fallback.meta.createdAt,
      updatedAt: rawState.meta?.updatedAt || fallback.meta.updatedAt,
    },
    contacts: Array.isArray(rawState.contacts) ? rawState.contacts : [],
    journal: Array.isArray(rawState.journal) ? rawState.journal : [],
    actions: Array.isArray(rawState.actions) ? rawState.actions : [],
    decisions: Array.isArray(rawState.decisions) ? rawState.decisions : [],
    communications: Array.isArray(rawState.communications) ? rawState.communications : [],

    // CRITICAL: Ensure phases structure is correct using a deep map
    phases: Array.isArray(rawState.phases)
      ? rawState.phases.map((p: any, index: number) => {
        const defaultPhase = fallback.phases[index] || fallback.phases[0]; // fallback to something valid

        // If p is null or undefined
        if (!p) return defaultPhase;

        // Safe access helpers for nested properties
        const pChecklist = p.checklist || {};
        const defChecklist = defaultPhase.checklist;

        return {
          id: p.id || defaultPhase.id,
          title: p.title || defaultPhase.title,
          checklist: {
            strategic: Array.isArray(pChecklist.strategic)
              ? pChecklist.strategic
              : defChecklist.strategic,
            operational: Array.isArray(pChecklist.operational)
              ? pChecklist.operational
              : defChecklist.operational
          },
          injects: Array.isArray(p.injects) ? p.injects : []
        };
      })
      : fallback.phases,
  };
}

// ----------------- IMPORT UTILS -----------------

export async function importJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawState = JSON.parse(e.target?.result as string);
        resolve(normalizeAppState(rawState));
      } catch (error) {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsText(file);
  });
}
