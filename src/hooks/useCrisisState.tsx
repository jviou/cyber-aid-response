import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, getOrCreateSessionId, loadState, getDefaultState } from '@/lib/stateStore';
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
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Debounced save function
  const debouncedSave = useCallback(async (newState: AppState) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        localStorage.setItem(`crisis-state-${sessionId}`, JSON.stringify(newState));
      } catch (error) {
        console.error('Error saving state:', error);
        toast.error('Erreur lors de la sauvegarde');
      }
    }, 500);

    setSaveTimeout(timeout);
  }, [sessionId, saveTimeout]);

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