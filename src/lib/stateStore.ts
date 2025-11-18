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
    owner: string;
    decidedAt: string;
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
const API_BASE_URL = (import.meta.env.VITE_CRISIS_API_URL as string | undefined) || 'http://127.0.0.1:4000';
const API_STATE_ENDPOINT = `${API_BASE_URL.replace(/\/$/, '')}/api/state`;

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
    journal: [],
    actions: [],
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
    const response = await fetch(`${API_STATE_ENDPOINT}?sessionId=${encodeURIComponent(sessionId)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch remote state');
    }
    const data = await response.json();
    return data.state || null;
  } catch (error) {
    console.warn('Unable to fetch remote state:', error);
    return null;
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
    throw new Error('Failed to persist remote state');
  }
}

async function deleteRemoteState(sessionId: string): Promise<void> {
  try {
    await fetch(`${API_STATE_ENDPOINT}/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.warn('Unable to delete remote state:', error);
  }
}

export async function loadState(sessionId: string): Promise<AppState> {
  const remoteState = await fetchRemoteState(sessionId);
  if (remoteState) {
    localStorage.setItem(`crisis-state-${sessionId}`, JSON.stringify(remoteState));
    return remoteState;
  }

  const localState = readLocalState(sessionId);
  if (localState) {
    try {
      await persistRemoteState(sessionId, localState);
    } catch (error) {
      console.warn('Unable to sync local state to remote:', error);
    }
    return localState;
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
  localStorage.setItem(`crisis-state-${sessionId}`, JSON.stringify(state));
  await persistRemoteState(sessionId, state);
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
        const state = JSON.parse(e.target?.result as string);
        resolve(state);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}
