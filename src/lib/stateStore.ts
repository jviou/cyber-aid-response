// No Supabase - local only
import { defaultPhases } from '@/data/crisisData';

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
  decisions: Array<{
    id: string;
    title: string;
    rationale: string;
    owner?: string;
    decidedAt: string;
    status?: 'À initier' | 'En cours' | 'En pause' | 'En retard' | 'Bloqué' | 'Terminé';
    kind?: 'I' | 'D' | 'A';
    dueDate?: string;
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

const SESSION_ID_KEY = 'crisis_session_id';
const DEFAULT_SESSION_ID = import.meta.env.VITE_DEFAULT_SESSION_ID as string | undefined;
const configuredApiUrl = (import.meta.env.VITE_CRISIS_API_URL as string | undefined)?.trim();
const configuredApiPort = (import.meta.env.VITE_CRISIS_API_PORT as string | undefined)?.trim();
const DEFAULT_API_PORT = configuredApiPort || '4000';

const API_STATE_PATH = '/api/state';
const API_BASE_CANDIDATES = buildApiBaseCandidates();
let preferredApiBase: string | null = null;

function buildApiBaseCandidates(): string[] {
  const bases: string[] = [];
  const seen = new Set<string>();

  const add = (value?: string) => {
    if (typeof value === 'undefined' || value === null) return;
    const normalized = value === '' ? '' : value.replace(/\/$/, '');
    if (seen.has(normalized)) return;
    seen.add(normalized);
    bases.push(normalized);
  };

  if (configuredApiUrl) {
    add(configuredApiUrl);
  }

  if (typeof window !== 'undefined' && window.location) {
    add('');
    const { protocol, hostname } = window.location;
    const portSuffix = DEFAULT_API_PORT ? `:${DEFAULT_API_PORT}` : '';
    add(`${protocol}//${hostname}${portSuffix}`);
  }

  add(`http://127.0.0.1${DEFAULT_API_PORT ? `:${DEFAULT_API_PORT}` : ''}`);

  return bases;
}

async function fetchWithApi(path: string, init?: RequestInit) {
  const tried = new Set<string>();
  const orderedCandidates = preferredApiBase
    ? [preferredApiBase, ...API_BASE_CANDIDATES.filter(base => base !== preferredApiBase)]
    : API_BASE_CANDIDATES;

  let lastError: unknown = null;

  for (const base of orderedCandidates) {
    if (tried.has(base)) continue;
    tried.add(base);

    const url = `${base}${path}`;
    try {
      const response = await fetch(url, init);
      if (!response.ok) {
        lastError = new Error(`Request failed with status ${response.status} for ${url}`);
        continue;
      }
      preferredApiBase = base;
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Unable to reach crisis API');
}

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

export function getDefaultState(): AppState {
  return {
    meta: {
      title: 'Nouvelle Session de Crise',
      mode: 'exercise',
      severity: 'Modérée',
      createdAt: new Date().toISOString()
    },
    contacts: [],
    decisions: [],
    communications: [],
    phases: defaultPhases.map(p => ({
      id: p.id as 'P1' | 'P2' | 'P3' | 'P4',
      title: `${p.title} - ${p.subtitle || ''}`.trim(),
      strategic: (p.checklist?.strategic || []).map(item => ({
        id: item.id,
        text: item.text,
        checked: item.status === 'done',
        assignee: null,
        dueAt: null
      })),
      operational: (p.checklist?.operational || []).map(item => ({
        id: item.id,
        text: item.text,
        checked: item.status === 'done',
        assignee: null,
        dueAt: null
      }))
    }))
  };
}

function normalizeAppState(rawState?: Partial<AppState> | null): AppState {
  const fallback = getDefaultState();
  if (!rawState) {
    return fallback;
  }

  return {
    meta: {
      title: rawState.meta?.title || fallback.meta.title,
      mode: rawState.meta?.mode || fallback.meta.mode,
      severity: rawState.meta?.severity || fallback.meta.severity,
      createdAt: rawState.meta?.createdAt || fallback.meta.createdAt
    },
    contacts: Array.isArray(rawState.contacts) ? rawState.contacts : [],
    decisions: Array.isArray(rawState.decisions) ? rawState.decisions : [],
    communications: Array.isArray(rawState.communications) ? rawState.communications : [],
    phases: Array.isArray(rawState.phases) ? rawState.phases : fallback.phases
  };
}

function readLocalState(sessionId: string): AppState | null {
  try {
    const stored = localStorage.getItem(`crisis-state-${sessionId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading local state:', error);
    return null;
  }
}

async function fetchRemoteState(sessionId: string): Promise<AppState | null> {
  try {
    const response = await fetchWithApi(`${API_STATE_PATH}?sessionId=${encodeURIComponent(sessionId)}`);
    const data = await response.json();
    return data.state || null;
  } catch (error) {
    console.warn('Unable to fetch remote state via available endpoints:', error);
    return null;
  }
}

async function persistRemoteState(sessionId: string, state: AppState): Promise<void> {
  await fetchWithApi(API_STATE_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId, state })
  });
}

async function deleteRemoteState(sessionId: string): Promise<void> {
  try {
    await fetchWithApi(`${API_STATE_PATH}/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.warn('Unable to delete remote state:', error);
  }
}

export async function loadState(sessionId: string): Promise<AppState> {
  const remoteState = await fetchRemoteState(sessionId);
  if (remoteState) {
    const sanitizedRemote = normalizeAppState(remoteState);
    localStorage.setItem(`crisis-state-${sessionId}`, JSON.stringify(sanitizedRemote));
    return sanitizedRemote;
  }

  const localState = readLocalState(sessionId);
  if (localState) {
    const sanitizedLocal = normalizeAppState(localState);
    try {
      await persistRemoteState(sessionId, sanitizedLocal);
    } catch (error) {
      console.warn('Unable to sync local state to remote:', error);
    }
    return sanitizedLocal;
  }

  const defaultState = getDefaultState();
  localStorage.setItem(`crisis-state-${sessionId}`, JSON.stringify(defaultState));
  try {
    await persistRemoteState(sessionId, defaultState);
  } catch (error) {
    console.warn('Unable to persist default state remotely:', error);
  }
  return defaultState;
}

export async function saveState(sessionId: string, state: AppState): Promise<void> {
  const sanitizedState = normalizeAppState(state);
  localStorage.setItem(`crisis-state-${sessionId}`, JSON.stringify(sanitizedState));
  await persistRemoteState(sessionId, sanitizedState);
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

export async function importJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawState = JSON.parse(e.target?.result as string);
        resolve(normalizeAppState(rawState));
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}
