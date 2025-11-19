import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, getOrCreateSessionId, loadState, getDefaultState, saveState, fetchRemoteSnapshot } from '@/lib/stateStore';
import { toast } from 'sonner';

interface CrisisStateContextType {
  state: AppState;
  sessionId: string;
  isLoading: boolean;
  updateState: (updater: (state: AppState) => AppState) => void;
  refreshState: () => Promise<void>;
}

const CrisisStateContext = createContext<CrisisStateContextType | null>(null);

export function useCrisisState() {
  const context = useContext(CrisisStateContext);
  if (!context) {
    throw new Error('useCrisisState must be used within a CrisisStateProvider');
  }
  return context;
}

export function CrisisStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getDefaultState());
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveFailureRef = useRef(false);
  const lastSaveErrorToastRef = useRef(0);

  // Load initial state
  useEffect(() => {
    const initializeState = async () => {
      try {
        const id = getOrCreateSessionId();
        setSessionId(id);
        const loadedState = await loadState(id);
        setState(loadedState);
      } catch (error) {
        console.error('Error initializing state:', error);
        toast.error('Erreur lors du chargement de la session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeState();
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Debounced save function
  const debouncedSave = useCallback((newState: AppState) => {
    if (!sessionId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveState(sessionId, newState);
        if (saveFailureRef.current) {
          toast.success('Connexion à l\'API restaurée, synchronisation active');
        }
        saveFailureRef.current = false;
      } catch (error) {
        console.error('Error saving state:', error);
        const now = Date.now();
        if (!saveFailureRef.current || now - lastSaveErrorToastRef.current > 30000) {
          toast.error('Sauvegarde distante indisponible, vos données restent stockées localement');
          lastSaveErrorToastRef.current = now;
        }
        saveFailureRef.current = true;
      }
    }, 500);
  }, [sessionId]);

  const updateState = useCallback((updater: (state: AppState) => AppState) => {
    setState(prevState => {
      const newState = updater(prevState);
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  const refreshState = useCallback(async () => {
    try {
      setIsLoading(true);
      const refreshedState = await loadState(sessionId);
      setState(refreshedState);
    } catch (error) {
      console.error('Error refreshing state:', error);
      toast.error('Erreur lors du rafraîchissement');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      const remote = await fetchRemoteSnapshot(sessionId);
      if (!remote) return;

      setState(prevState => {
        const prevHash = JSON.stringify(prevState);
        const nextHash = JSON.stringify(remote);
        if (prevHash === nextHash) {
          return prevState;
        }

        localStorage.setItem(`crisis-state-${sessionId}`, JSON.stringify(remote));
        return remote;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <CrisisStateContext.Provider 
      value={{
        state,
        sessionId,
        isLoading,
        updateState,
        refreshState
      }}
    >
      {children}
    </CrisisStateContext.Provider>
  );
}