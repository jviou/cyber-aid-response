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
    dueAt: string | null;
    createdAt: string;
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

export function generateSessionId(): string {
  // Récupère l’API crypto du navigateur si elle existe
  const globalCrypto =
    typeof window !== 'undefined'
      ? window.crypto
      : typeof globalThis !== 'undefined'
      ? (globalThis as any).crypto
      : undefined;

  // Cas “propre” : contexte sécurisé (https ou localhost) + randomUUID dispo
  if (globalCrypto && 'randomUUID' in globalCrypto) {
    return (globalCrypto as Crypto).randomUUID();
  }

  // Fallback pour http://IP:8080 et autres contextes non sécurisés
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
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

export async function loadState(sessionId: string): Promise<AppState> {
  const stored = localStorage.getItem(`crisis-state-${sessionId}`);
  return stored ? JSON.parse(stored) : getDefaultState();
}

export async function resetSession(currentSessionId: string): Promise<string> {
  localStorage.removeItem(`crisis-state-${currentSessionId}`);
  const newSessionId = generateSessionId();
  return newSessionId;
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