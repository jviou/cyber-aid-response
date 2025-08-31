import { useState, useEffect, useCallback } from "react";
import { CrisisSession, Mode, Severity, JournalEvent, ActionItem } from "@/types/crisis";
import { defaultPhases, defaultKeyContacts, exerciseDefaults, seedJournalEvents, seedActions } from "@/data/crisisData";

const STORAGE_KEY = "crisis-session";
const AUTOSAVE_INTERVAL = 5000; // 5 seconds

export function useCrisisSession() {
  const [session, setSession] = useState<CrisisSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession(parsed);
      } catch (error) {
        console.error("Failed to load session:", error);
      }
    }
    setIsLoading(false);
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [session]);

  const createSession = useCallback((
    mode: Mode, 
    title: string, 
    description: string, 
    severity: Severity
  ) => {
    const newSession: CrisisSession = {
      id: `crisis-${Date.now()}`,
      mode,
      title,
      description,
      severity,
      createdAt: new Date().toISOString(),
      phases: defaultPhases.map(phase => ({
        ...phase,
        checklist: {
          strategic: phase.checklist.strategic.map(item => ({ ...item })),
          operational: phase.checklist.operational.map(item => ({ ...item }))
        },
        injects: []
      })),
      journal: mode === "real" ? seedJournalEvents : [{
        id: `journal-${Date.now()}`,
        category: "detection",
        title: "Début de l'exercice",
        details: description,
        by: "Système",
        at: new Date().toISOString()
      }],
      actions: mode === "real" ? seedActions : [],
      decisions: [],
      communications: [],
      resources: [],
      keyContacts: [...defaultKeyContacts],
      ...(mode === "exercise" ? exerciseDefaults : {})
    };

    setSession(newSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  }, []);

  const updateSession = useCallback((updater: (session: CrisisSession) => CrisisSession) => {
    setSession(current => {
      if (!current) return null;
      const updated = updater(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const saveSession = useCallback(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return true;
    }
    return false;
  }, [session]);

  const exportSession = useCallback(() => {
    if (!session) return;
    
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `crisis-session-${session.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [session]);

  const loadSession = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setSession(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to load session file:", error);
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    session,
    isLoading,
    createSession,
    updateSession,
    clearSession,
    saveSession,
    exportSession,
    loadSession
  };
}