import { useEffect, useState, useCallback } from "react";
import type { AppState } from "@/lib/stateStore";
import {
  getDefaultState,
  getOrCreateSessionId,
  loadState,
  saveState,
  fetchRemoteSnapshot,
} from "@/lib/stateStore";

const SYNC_INTERVAL_MS =
  Number(import.meta.env.VITE_SYNC_INTERVAL_MS || 5000); // 5s par défaut

interface UseCrisisStateResult {
  state: AppState;
  sessionId: string;
  isLoading: boolean;
  updateState: (updater: (prev: AppState) => AppState) => void;
  reloadFromServer: () => Promise<void>;
}

export function useCrisisState(): UseCrisisStateResult {
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [state, setState] = useState<AppState>(() => getDefaultState());
  const [isLoading, setIsLoading] = useState(true);

  // Chargement initial depuis l'API (ou local si l’API ne répond pas)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        const initial = await loadState(sessionId);
        if (!cancelled) {
          setState(initial);
        }
      } catch (error) {
        console.warn("Failed to load initial crisis state:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Fonction pour mettre à jour l'état local + pousser vers l'API
  const updateState = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setState((prev) => {
        const next = updater(prev);
        // on pousse en arrière-plan vers l'API
        void saveState(sessionId, next).catch((error) => {
          console.warn("Failed to save crisis state:", error);
        });
        return next;
      });
    },
    [sessionId],
  );

  // Reload manuel depuis le serveur (si un jour tu veux un bouton "Recharger")
  const reloadFromServer = useCallback(async () => {
    try {
      const remote = await fetchRemoteSnapshot(sessionId);
      if (remote) {
        setState(remote);
      }
    } catch (error) {
      console.warn("Failed to reload crisis state from server:", error);
    }
  }, [sessionId]);

  // Synchronisation automatique périodique (polling)
  useEffect(() => {
    if (!SYNC_INTERVAL_MS || SYNC_INTERVAL_MS < 500) return;

    let cancelled = false;

    const timer = setInterval(async () => {
      try {
        const remote = await fetchRemoteSnapshot(sessionId);
        if (!remote || cancelled) return;

        setState((current) => {
          // Si rien n'a changé, on ne touche pas au state
          const currentStr = JSON.stringify(current);
          const remoteStr = JSON.stringify(remote);
          if (currentStr === remoteStr) {
            return current;
          }
          // Sinon on met à jour avec la version distante
          return remote;
        });
      } catch (error) {
        console.warn("Background sync failed:", error);
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [sessionId]);

  return {
    state,
    sessionId,
    isLoading,
    updateState,
    reloadFromServer,
  };
}
