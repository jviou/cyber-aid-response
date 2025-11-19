// src/lib/stateStore.ts
// Pas de Supabase : stockage local + API Node simple

// ===== Types d'état =========================================================

export interface AppState {
  meta: {
    title: string;
    mode: 'real' | 'exercise';
    severity: 'Low' | 'Modérée' | 'Élevée' | 'Critique';
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
    category: 'incident' | 'action' | 'decision' | 'communication' | 'technical' | 'legal' | 'note';
    title: string;
    details: string;
  }>;
  actions: Array<{
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'doing' | 'done';
    owner: string;
    priority?: 'low' | 'med' | 'high';
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
    status?: 'À initier' | 'En cours' | 'En pause' | 'En retard' | 'Bloqué' | 'Terminé';
  }>;
  communications: Array<{
    id: string;
    audience: string;
    subject: string;
    message: string;
    sentAt: string;
  }>;
  phases: Array<{
    id: 'P1' | 'P2' | 'P3' | 'P4';
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

// ===== Config API ===========================================================

const SESSION_ID_KEY = 'crisis_session_id';

// ID de session par défaut (permet de forcer tout le monde sur la même)
const DEFAULT_SESSION_ID = (import.meta.env.VITE_DEFAULT_SESSION_ID as string | undefined) || 'crisis-session-001';

const configuredApiUrl = (import.meta.env.VITE_CRISIS_API_URL as string | undefined)?.trim();
const API_STATE_PATH = '/api/state';

function buildApiBaseCandidates(): string[] {
  const bases: string[] = [];
  const seen = new Set<string>();

  const add = (value?: string | null) => {
    if (!value && value !== '') return;
    const trimmed = value.trim();
    // '' = même origine
    const normalized = trimmed === '' ? '' : trimmed.replace(/\/$/, '');
    if (seen.has(normalized)) return;
    seen.add(normalized);
    bases.push(normalized);
  };

  // 1) Valeur de VITE_CRISIS_API_URL si définie (dev .env.local par ex.)
  if (configuredApiUrl) add(configuredApiUrl);

  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;

    // 2) Même origine (proxy inverse éventuel)
    add('');

    // 3) Même host, port 4000 (cas Docker : front 8069, API 4000)
    add(`${protocol}//${hostname}:4000`);
  }

  // 4) Fallback : localhost:4000
  add('http://127.0.0.1:4000');

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

      // 1) Statut HTTP OK ?
      if (!res.ok) {
        lastError = new Error(`Request failed with status ${res.status} for ${url}`);
        continue;
      }

      // 2) Vérifier qu'on parle bien à l'API (JSON), pas au frontend (HTML)
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        lastError = new Error(`Non-JSON response from ${url} (${contentType})`);
        continue;
      }

      preferredApiBase = base;
      return res;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error('Unable to reach crisis API');
}

// ===== Génération d'ID de session ==========================================

export function generateSessionId(): string {
  const globalCrypto =
    typeof window !== 'undefined'
      ? window.crypto
      : typeof globalThis !== 'undefined'
      ? (globalThis as any).crypto
      : undefined;

  if (globalCrypto && 'randomUUID' in globalCrypto) {
    return (globalCrypto as Crypto).randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateSessionId(): string {
  let sessionId = DEFAULT_SESSION_ID || localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
  }
  localStorage.setItem(SESSION_ID_KEY, sessionId);
  return sessionId;
}

// ===== État par défaut ======================================================

import { defaultPhases } from '@/data/crisisData';

export function getDefaultState(): AppState {
  return {
    meta: {
      title: 'Nouvelle Session de Crise',
      mode: 'exercise',
      severity: 'Modérée',
      createdAt: new Date().toISOString(),
    },
    contacts: [],
    journal: [],
    actions: [],
    decisions: [],
    communications: [],
    phases: defaultPhases.map((p) => ({
      id: p.id as 'P1' | 'P2' | 'P3' | 'P4',
      title: `${p.title} - ${p.subtitle || ''}`.trim(),
      strategic: (p.checklist?.strategic || []).map((item) => ({
        id: item.id,
        text: item.text,
        checked: item.status === 'done',
        assignee: null,
        dueAt: null,
      })),
      operational: (p.checklist?.operational || []).map((item) => ({
        id: item.id,
        text: item.text,
        checked: item.status === 'done',
        assignee: null,
        dueAt: null,
      })),
    })),
  };
}

// Petite sécurité si un JSON part en vrille
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
    communications: Array.isArray(rawState.communications) ? rawState.communications : [],
    phases: Array.isArray(rawState.phases) ? rawState.phases : fallback.phases,
  };
}

// ===== LocalStorage =========================================================

function readLocalState(sessionId: string): AppState | null {
  try {
    const stored = localStorage.getItem(`crisis-state-${sessionId}`);
    return stored ? sanitizeState(JSON.parse(stored)) : null;
  } catch (err) {
    console.error('Error reading local state:', err);
    return null;
  }
}

// ===== API distante =========================================================

async function fetchRemoteState(sessionId: string): Promise<AppState | null> {
  try {
    const res = await fetchWithApi(`${API_STATE_PATH}?sessionId=${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    return data?.state ? sanitizeState(data.state) : null;
  } catch (error) {
    console.warn('Unable to fetch remote state via available endpoints:', error);
    return null;
  }
}

async function persistRemoteState(sessionId: string, state: AppState): Promise<void> {
  const res = await fetchWithApi(API_STATE_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, state }),
  });
  if (!res.ok) {
    throw new Error('Failed to persist remote state');
  }
}

async function deleteRemoteState(sessionId: string): Promise<void> {
  try {
    await fetchWithApi(`${API_STATE_PATH}/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
  } catch (error) {
    console.warn('Unable to delete remote state:', error);
  }
}

// ===== API publique utilisée par le hook ====================================

export async function loadState(sessionId: string): Promise<AppState> {
  // 1) Essayer la version distante
  const remote = await fetchRemoteState(sessionId);
  if (remote) {
    localStorage.setItem(`crisis-state-${sessionId}`, JSON.stringify(remote));
    return remote;
  }

  // 2) Sinon, tomber sur le local
  const local = readLocalState(sessionId);
  if (local) {
    try {
      await persistRemoteState(sessionId, local);
    } catch (error) {
      console.warn('Unable to sync local state to remote:', error);
    }
    return local;
  }

  // 3) Sinon, créer un état par défaut
  const def = getDefaultState();
  localStorage.setItem(`crisis-state-${sessionId}`, JSON.stringify(def));
  try {
    await persistRemoteState(sessionId, def);
  } catch (error) {
    console.warn('Unable to persist default state remotely:', error);
  }
  return def;
}

export async function saveState(sessionId: string, state: AppState): Promise<void> {
  const sanitized = sanitizeState(state);
  localStorage.setItem(`crisis-state-${sessionId}`, JSON.stringify(sanitized));
  await persistRemoteState(sessionId, sanitized);
}

export async function deleteState(sessionId: string): Promise<void> {
  localStorage.removeItem(`crisis-state-${sessionId}`);
  await deleteRemoteState(sessionId);
}

export async function resetSession(currentSessionId: string): Promise<string> {
  await deleteState(currentSessionId);
  const newSessionId = DEFAULT_SESSION_ID || generateSessionId();
  localStorage.setItem(SESSION_ID_KEY, newSessionId);
  return newSessionId;
}

export async function fetchRemoteSnapshot(sessionId: string): Promise<AppState | null> {
  return fetchRemoteState(sessionId);
}

// Import JSON depuis fichier
export async function importJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        resolve(sanitizeState(raw));
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}
