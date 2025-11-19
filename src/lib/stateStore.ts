// No Supabase - local only
import { defaultPhases } from '@/data/crisisData';

export interface AppState {
  meta: {
    title: string;
    mode: 'real' | 'exercise';
    severity: 'Low' | 'Modérée' | 'Élevée' | 'Critique';
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
const DEFAULT_API_BASE = 'http://crisis-api:4000';
const API_BASE_URL = (configuredApiUrl && configuredApiUrl !== '' ? configuredApiUrl : DEFAULT_API_BASE).replace(/\/$/, '');
const API_STATE_ENDPOINT = `${API_BASE_URL}/api/state`;
const STORAGE_KEY_PREFIX = 'crisis-state-';

export interface LoadStateOptions {
  onRemoteLoadError?: (error: Error) => void;
  onRemoteLoadSuccess?: () => void;
}

export interface SaveStateOptions {
  onRemoteSaveError?: (error: Error) => void;
  onRemoteSaveSuccess?: () => void;
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
  if (DEFAULT_SESSION_ID) {
    try {
      localStorage.setItem(SESSION_ID_KEY, DEFAULT_SESSION_ID);
    } catch (error) {
      console.warn('Unable to persist default session ID locally:', error);
    }
    return DEFAULT_SESSION_ID;
  }

  let sessionId = null;
  try {
    sessionId = localStorage.getItem(SESSION_ID_KEY);
  } catch (error) {
    console.warn('Unable to read local session ID:', error);
  }

  if (!sessionId) {
    sessionId = generateSessionId();
  }

  try {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  } catch (error) {
    console.warn('Unable to persist session ID locally:', error);
  }

  return sessionId;
}

export function getDefaultState(): AppState {
  const now = new Date().toISOString();
  return {
    meta: {
      title: 'Nouvelle Session de Crise',
      mode: 'exercise',
      severity: 'Modérée',
      createdAt: now,
      updatedAt: now
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
      createdAt: rawState.meta?.createdAt || fallback.meta.createdAt,
      updatedAt:
        rawState.meta?.updatedAt ||
        rawState.meta?.createdAt ||
        fallback.meta.updatedAt ||
        new Date().toISOString()
    },
    contacts: Array.isArray(rawState.contacts) ? rawState.contacts : [],
    decisions: Array.isArray(rawState.decisions) ? rawState.decisions : [],
    communications: Array.isArray(rawState.communications) ? rawState.communications : [],
    phases: Array.isArray(rawState.phases) ? rawState.phases : fallback.phases
  };
}

function readLocalState(sessionId: string): AppState | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${sessionId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading local state:', error);
    return null;
  }
}

function writeLocalState(sessionId: string, state: AppState) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${sessionId}`, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist state locally:', error);
  }
}

async function fetchRemoteState(sessionId: string): Promise<AppState | null> {
  const response = await fetch(`${API_STATE_ENDPOINT}?sessionId=${encodeURIComponent(sessionId)}`);
  if (!response.ok) {
    throw new Error(`Remote state request failed with status ${response.status}`);
  }

  try {
    const data = await response.json();
    return data.state || null;
  } catch (error) {
    const body = await response.text();
    throw new Error(
      `Unable to parse remote state response: ${(error as Error).message || 'invalid JSON'} | body: ${body.slice(0, 200)}`
    );
  }
}

async function persistRemoteState(sessionId: string, state: AppState): Promise<void> {
  const response = await fetch(API_STATE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId, state })
  });

  if (!response.ok) {
    throw new Error(`Remote save failed with status ${response.status}`);
  }
}

async function deleteRemoteState(sessionId: string): Promise<void> {
  const response = await fetch(`${API_STATE_ENDPOINT}/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE'
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Remote delete failed with status ${response.status}`);
  }
}

export async function loadState(sessionId: string, options?: LoadStateOptions): Promise<AppState> {
  try {
    const remoteState = await fetchRemoteState(sessionId);
    if (remoteState) {
      const normalizedRemote = normalizeAppState(remoteState);
      writeLocalState(sessionId, normalizedRemote);
      options?.onRemoteLoadSuccess?.();
      return normalizedRemote;
    }
    options?.onRemoteLoadSuccess?.();
  } catch (error) {
    console.warn('Unable to fetch remote state:', error);
    options?.onRemoteLoadError?.(error as Error);
  }

  const localState = readLocalState(sessionId);
  if (localState) {
    const normalizedLocal = normalizeAppState(localState);
    try {
      await persistRemoteState(sessionId, normalizedLocal);
      options?.onRemoteLoadSuccess?.();
    } catch (error) {
      console.warn('Unable to sync local state to remote:', error);
    }
    return normalizedLocal;
  }

  const defaultState = getDefaultState();
  writeLocalState(sessionId, defaultState);
  try {
    await persistRemoteState(sessionId, defaultState);
    options?.onRemoteLoadSuccess?.();
  } catch (error) {
    console.warn('Unable to persist default state remotely:', error);
    options?.onRemoteLoadError?.(error as Error);
  }
  return defaultState;
}

export async function saveState(sessionId: string, state: AppState, options?: SaveStateOptions): Promise<void> {
  const sanitizedState = normalizeAppState(state);
  writeLocalState(sessionId, sanitizedState);
  try {
    await persistRemoteState(sessionId, sanitizedState);
    options?.onRemoteSaveSuccess?.();
  } catch (error) {
    console.error('Unable to persist state remotely:', error);
    options?.onRemoteSaveError?.(error as Error);
  }
}

export async function deleteState(sessionId: string): Promise<void> {
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${sessionId}`);
  try {
    await deleteRemoteState(sessionId);
  } catch (error) {
    console.warn('Unable to delete remote state:', error);
  }
}

export async function resetSession(currentSessionId: string): Promise<string> {
  await deleteState(currentSessionId);
  const newSessionId = DEFAULT_SESSION_ID || generateSessionId();
  try {
    localStorage.setItem(SESSION_ID_KEY, newSessionId);
  } catch (error) {
    console.warn('Unable to persist new session ID locally:', error);
  }
  return newSessionId;
}

export async function fetchRemoteSnapshot(sessionId: string): Promise<AppState | null> {
  try {
    const snapshot = await fetchRemoteState(sessionId);
    return snapshot ? normalizeAppState(snapshot) : null;
  } catch (error) {
    console.warn('Remote snapshot fetch failed:', error);
    return null;
  }
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
