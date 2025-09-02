import { supabase } from '@/integrations/supabase/client';

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
  return crypto.randomUUID();
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
    phases: [
      {
        id: 'P1',
        title: 'Phase 1 - Mobiliser',
        strategic: [],
        operational: []
      },
      {
        id: 'P2', 
        title: 'Phase 2 - Confiance',
        strategic: [],
        operational: []
      },
      {
        id: 'P3',
        title: 'Phase 3 - Relancer', 
        strategic: [],
        operational: []
      },
      {
        id: 'P4',
        title: 'Phase 4 - Capitaliser',
        strategic: [],
        operational: []
      }
    ]
  };
}

export async function loadState(sessionId: string): Promise<AppState> {
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('state')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('Error loading state:', error);
      return getDefaultState();
    }

    return (data?.state as unknown as AppState) || getDefaultState();
  } catch (error) {
    console.error('Error loading state:', error);
    return getDefaultState();
  }
}

export async function saveState(sessionId: string, state: AppState): Promise<void> {
  try {
    const { error } = await supabase
      .from('app_state')
      .upsert({
        session_id: sessionId,
        state: state as any,
        updated_at: new Date().toISOString()
      } as any);

    if (error) {
      console.error('Error saving state:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving state:', error);
    throw error;
  }
}

export async function resetSession(currentSessionId: string): Promise<string> {
  try {
    // Delete app_state record
    await supabase
      .from('app_state')
      .delete()
      .eq('session_id', currentSessionId);

    // Delete resources records
    await supabase
      .from('resources')
      .delete()
      .eq('session_id', currentSessionId);

    // Delete files from storage bucket
    const { data: files } = await supabase.storage
      .from('resources')
      .list(currentSessionId);

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${currentSessionId}/${file.name}`);
      await supabase.storage
        .from('resources')
        .remove(filePaths);
    }

    // Generate new session ID
    const newSessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, newSessionId);

    return newSessionId;
  } catch (error) {
    console.error('Error resetting session:', error);
    throw error;
  }
}

export function exportJSON(state: AppState): void {
  const dataStr = JSON.stringify(state, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `crisis-session-${new Date().toISOString().slice(0, 19)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
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