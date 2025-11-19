// src/hooks/useCrisisState.tsx
// Hook unique pour gérer l’état + synchro régulière avec l’API

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  fetchRemoteSnapshot,
  getDefaultState,
  getOrCreateSessionId,
  loadState,
  saveState,
} from "@/lib/stateStore";

interface CrisisStateHook {
  state: AppState;
  setState: (updater: (prev: AppState) => AppState) => void;
  sessionId: string;
  loading: boolean;
  saving: boolean;
  lastSyncAt: string | null;
  forceReload: () => Promise<void>;
}

const POLL_INTERVAL_MS = 5_000; // 5 secondes

export function useCrisisState(): CrisisStateHook {
  const initialSessionId =
    typeof window !== "undefined" ? getOrCreateSessionId() : "crisis-session-001";

  const [sessionId] = useState<string>(initialSessionId);
  const [state, setStateInternal] = useState<AppState>(getDefaultState);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const lastRemoteSnapshotRef = useRef<string | null>(null);
  const isMountedRef = useRef<boolean>(false);

  // Chargement initial -------------------------------------------------------
  useEffect(() => {
    isMountedRef.current = true;

    (async () => {
      try {
        const loaded = await loadState(sessionId);
        if (!isMountedRef.current) return;
        setStateInternal(loaded);
        setLastSyncAt(new Date().toISOString());
      } catch (error) {
        console.error("Error loading crisis state:", error);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMountedRef.current = false;
    };
  }, [sessionId]);

  // Mise à jour locale + remote ---------------------------------------------
  const setState = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setStateInternal((prev) => {
        const next = updater(prev);
        // écrit directement en local, la partie remote est async
        (async () => {
          try {
            setSaving(true);
            await saveState(sessionId, next);
            if (isMountedRef.current) {
              setLastSyncAt(new Date().toISOString());
            }
          } catch (error) {
            console.error("Error saving crisis state:", error);
          } finally {
            if (isMountedRef.current) {
              setSaving(false);
            }
          }
        })();
        return next;
      });
    },
    [sessionId]
  );

  // Polling régulier pour récupérer les changements d’un autre poste --------
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionId) return;

    const intervalId = window.setInterval(async () => {
      try {
        const remote = await fetchRemoteSnapshot(sessionId);
        if (!remote) return;

        const serialized = JSON.stringify(remote);
        if (serialized === lastRemoteSnapshotRef.current) {
          return;
        }

        lastRemoteSnapshotRef.current = serialized;
        if (isMountedRef.current) {
          setStateInternal(remote);
          setLastSyncAt(new Date().toISOString());
        }
      } catch (error) {
        console.warn("Error polling remote crisis state:", error);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [sessionId]);

  // Reload manuel (bouton éventuel) -----------------------------------------
  const forceReload = useCallback(async () => {
    try {
      setLoading(true);
      const fresh = await loadState(sessionId);
      if (!isMountedRef.current) return;
      setStateInternal(fresh);
      setLastSyncAt(new Date().toISOString());
    } catch (error) {
      console.error("Error reloading crisis state:", error);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [sessionId]);

  return {
    state,
    setState,
    sessionId,
    loading,
    saving,
    lastSyncAt,
    forceReload,
  };
}
