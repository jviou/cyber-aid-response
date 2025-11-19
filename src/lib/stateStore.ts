// src/lib/stateStore.ts
// Stockage de l’état + sync avec une petite API Node (crisis-api-server.js)

import { defaultPhases } from "@/data/crisisData";

// ===== Types d'état =========================================================

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

// ===== Config / session =====================================================

const SESSION_ID_KEY = "crisis_session_id";

// ID de session par défaut : tout le monde verra la même session
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
  if (typeof window === "undefined") {
    // sécurité SSR / build
    return DEFAULT_SESSION_ID;
  }

  let sessionId =
    DEFAULT_SESSION_ID || window.localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
  }
  window.localStorage.setItem(SESSION_ID_KEY, sessionId);
  return sessionId;
}

// ===== État par défaut ======================================================

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

// ===== Sanitize =============================================================

export function sanitizeState(
  rawState?: Partial<AppState> | null
): AppState {
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
    phases: Array.isArray(rawState.phases)
      ? rawState.phases
      : fallback.phases,
  };
}

// ===== LocalStorage =========================================================

function readLocalState(sessionId: string): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(
      `crisis-state-${sessionId}`
    );
    return stored ? sanitizeState(JSON.parse(stored)) : null;
  } catch (err) {
    console.error("Error reading local state:", err);
    return null;
  }
}

function writeLocalState(sessionId: string, state: AppState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `crisis-state-${sessionId}`,
      JSON.stringify(state)
    );
  } catch (err) {
    console.error("Error writing local state:", err);
  }
}

// ===== API distante =========================================================

const configuredApiUrl = (import.meta.env.VITE_CRISIS_API_URL as
  | string
  | undefined)?.trim();
const API_STATE_PATH = "/api/state";

function buildApiBaseCandidates(): string[] {
  const bases: string[] = [];
  const seen = new Set<string>();

  const add = (value?: string | null) => {
    if (value == null) return;
    const trimmed = value.trim();
    const normalized = trimmed === "" ? "" : trimmed.replace(/\/$/, "");
    if (seen.has(normalized)) return;
    seen.add(normalized);
    bases.push(normalized);
  };

  if (configuredApiUrl) add(configuredApiUrl);

  if (typeof window !== "undefined" && window.location) {
    const { protocol, hostname } = window.location;
    add(""); // même origine
    add(`${protocol}//${hostname}:4000`); // cas Docker
  }

  add("http://127.0.0.1:4000");
  return bases;
}

const API_BASE_CANDIDATES = buildApiBaseCandidates();
let preferredApiBase: string | null = null;

async function fetchWithApi(path: string, init?: RequestInit) {
  const tried = new Set<string>();
  const ordered = preferredApiBase
    ? [preferredApiBase, ...API_BASE_CANDIDATES.filter((b) => b !== preferredApiBase)]
    : API_BASE_CANDIDATES;

  let lastError: unknown = null;

  for (const base of ordered) {
    if (tried.has(base)) continue;
    tried.add(base);

    const url = `${base}${path}`;
    try {
      const res = await fetch(url, init);
      if (!res.ok) {
        lastError = new Error(
          `Request failed with status ${res.status} for ${url}`
        );
        continue;
      }
      preferredApiBase = base;
      return res;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("Unable to reach crisis API");
}

export async function fetchRemoteState(
  sessionId: string
): Promise<AppState | null> {
  try {
    const res = await fetchWithApi(
      `${API_STATE_PATH}?sessionId=${encodeURIComponent(sessionId)}`
    );
    const data = await res.json().catch(() => null);
    if (!data || typeof data !== "object") return null;
    return data.state ? sanitizeState(data.state) : null;
  } catch (error) {
    console.warn(
      "Unable to fetch remote state via available endpoints:",
      error
    );
    return null;
  }
}

export async function persistRemoteState(
  sessionId: string,
  state: AppState
): Promise<void> {
  try {
    const res = await fetchWithApi(API_STATE_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, state }),
    });
    if (!res.ok) {
      console.warn("Failed to persist remote state, status:", res.status);
    }
  } catch (error) {
    console.warn("Unable to persist remote state:", error);
  }
}

export async function deleteRemoteState(
  sessionId: string
): Promise<void> {
  try {
    await fetchWithApi(
      `${API_STATE_PATH}/${encodeURIComponent(sessionId)}`,
      { method: "DELETE" }
    );
  } catch (error) {
    console.warn("Unable to delete remote state:", error);
  }
}

// ===== API publique pour le hook ===========================================

export async function loadState(sessionId: string): Promise<AppState> {
  // 1) Essayer la version distante
  const remote = await fetchRemoteState(sessionId);
  if (remote) {
    writeLocalState(sessionId, remote);
    return remote;
  }

  // 2) Sinon, tomber sur le local
  const local = readLocalState(sessionId);
  if (local) {
    // Best effort : pousse le local vers le serveur
    await persistRemoteState(sessionId, local);
    return local;
  }

  // 3) Sinon, état par défaut
  const def = getDefaultState();
  writeLocalState(sessionId, def);
  await persistRemoteState(sessionId, def);
  return def;
}

export async function saveState(
  sessionId: string,
  state: AppState
): Promise<void> {
  const sanitized = sanitizeState(state);
  writeLocalState(sessionId, sanitized);
  await persistRemoteState(sessionId, sanitized);
}

export async function resetSession(
  currentSessionId: string
): Promise<string> {
  writeLocalState(currentSessionId, getDefaultState());
  await deleteRemoteState(currentSessionId);
  const newSessionId = DEFAULT_SESSION_ID || generateSessionId();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_ID_KEY, newSessionId);
  }
  return newSessionId;
}

export async function fetchRemoteSnapshot(
  sessionId: string
): Promise<AppState | null> {
  return fetchRemoteState(sessionId);
}
