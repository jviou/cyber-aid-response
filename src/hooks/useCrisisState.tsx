import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, getDefaultState, normalizeAppState } from '@/lib/stateStore';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

interface CrisisStateContextType {
  state: AppState;
  sessionId: string;
  isLoading: boolean;
  updateState: (updater: (state: AppState) => AppState) => void;
  refreshState: () => Promise<void>;
  socket: Socket | null;
}

const CrisisStateContext = createContext<CrisisStateContextType | null>(null);

export function useCrisisState() {
  const context = useContext(CrisisStateContext);
  if (!context) {
    throw new Error('useCrisisState must be used within a CrisisStateProvider');
  }
  return context;
}

// Dynamically determine the socket URL
function getSocketUrl() {
  // Always use dynamic detection for local/offline mode
  // ignoring any potential baked-in environment variables that might be wrong (e.g. https on http setup)

  if (typeof window !== "undefined") {
    // Monolithic deployment: Connect to the same origin (host + port)
    return window.location.origin;
  }

  return "http://localhost:4000";
}

export function CrisisStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getDefaultState());
  const [sessionId, setSessionId] = useState<string>('shared-session'); // Single session
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const hasLoadedRef = useRef(false);

  // Initialize Socket connection
  useEffect(() => {
    // Only connect once
    if (socketRef.current) return;

    const socketUrl = getSocketUrl();
    console.log("Connecting to WebSocket:", socketUrl);

    const socket = io(socketUrl, {
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      toast.success("Connecté au serveur temps réel");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
      // If we are stuck in loading state (first load) and fail to connect,
      // we should eventually show the UI with default/empty state to avoid infinite spinner.
      if (!hasLoadedRef.current) {
        toast.error("Impossible de contacter le serveur. Mode hors ligne (données non sauvegardées).");
        setIsLoading(false);
        hasLoadedRef.current = true;
      }
    });

    socket.on("state-update", (newState: AppState) => {
      console.log("Received state update from server");
      // Validate/Normalize incoming state to prevent crashes
      const safeState = normalizeAppState(newState);
      setState(safeState);
      setIsLoading(false);
      hasLoadedRef.current = true;
    });

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Sync function that emits updates
  const updateState = useCallback((updater: (state: AppState) => AppState) => {
    setState(prevState => {
      const newState = updater(prevState);
      const timestampedState: AppState = {
        ...newState,
        meta: {
          ...newState.meta,
          updatedAt: new Date().toISOString()
        }
      };

      // Emit to server
      if (socketRef.current?.connected) {
        socketRef.current.emit("client-update", timestampedState);
      } else {
        toast.error("Déconnecté du serveur, modification locale uniquement (non sauvegardée)");
      }
      return timestampedState;
    });
  }, []);

  const refreshState = useCallback(async () => {
    // With sockets, refresh is just asking for state again?
    // Or manually fetching via REST if socket fails.
    // For now, force a re-connect request if needed or just log
    console.log("Manual refresh requested - expecting socket update");
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, []);

  return (
    <CrisisStateContext.Provider
      value={{
        state,
        sessionId,
        isLoading,
        updateState,
        refreshState,
        socket: socketRef.current
      }}
    >
      {children}
    </CrisisStateContext.Provider>
  );
}
