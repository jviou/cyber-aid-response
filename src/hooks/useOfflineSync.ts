import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNetworkStatus } from './useNetworkStatus';
import { toast } from 'sonner';

interface PendingOperation {
  id: string;
  client_op_id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [pendingOps, setPendingOps] = useState<PendingOperation[]>([]);
  const [issyncing, setIsSyncing] = useState(false);
  const isOnline = useNetworkStatus();

  // Load pending operations from IndexedDB on mount
  useEffect(() => {
    loadPendingOperations();
  }, []);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && pendingOps.length > 0 && !issyncing) {
      syncPendingOperations();
    }
  }, [isOnline, pendingOps.length, issyncing]);

  const loadPendingOperations = async () => {
    try {
      const request = indexedDB.open('CrisisOfflineDB', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('pendingOps')) {
          db.createObjectStore('pendingOps', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['pendingOps'], 'readonly');
        const store = transaction.objectStore('pendingOps');
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          setPendingOps(getAllRequest.result || []);
        };
      };
    } catch (error) {
      console.error('Error loading pending operations:', error);
    }
  };

  const savePendingOperation = async (op: PendingOperation) => {
    try {
      const request = indexedDB.open('CrisisOfflineDB', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['pendingOps'], 'readwrite');
        const store = transaction.objectStore('pendingOps');
        store.add(op);
      };
      setPendingOps(prev => [...prev, op]);
    } catch (error) {
      console.error('Error saving pending operation:', error);
    }
  };

  const removePendingOperation = async (id: string) => {
    try {
      const request = indexedDB.open('CrisisOfflineDB', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['pendingOps'], 'readwrite');
        const store = transaction.objectStore('pendingOps');
        store.delete(id);
      };
      setPendingOps(prev => prev.filter(op => op.id !== id));
    } catch (error) {
      console.error('Error removing pending operation:', error);
    }
  };

  const syncPendingOperations = async () => {
    if (issyncing || !isOnline) return;
    
    setIsSyncing(true);
    toast.info('Synchronisation en cours...');

    try {
      for (const op of pendingOps) {
        try {
          let result;
          switch (op.operation) {
            case 'insert':
              result = await (supabase as any).from(op.table).insert(op.data);
              break;
            case 'update':
              result = await (supabase as any).from(op.table).update(op.data).eq('client_op_id', op.client_op_id);
              break;
            case 'delete':
              result = await (supabase as any).from(op.table).delete().eq('client_op_id', op.client_op_id);
              break;
          }
          
          if (result?.error) {
            console.error('Sync error for operation:', op, result.error);
          } else {
            await removePendingOperation(op.id);
          }
        } catch (error) {
          console.error('Failed to sync operation:', op, error);
        }
      }
      
      if (pendingOps.length > 0) {
        toast.success('Synchronisation terminée');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Erreur de synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  const queueOperation = useCallback((
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: any
  ) => {
    const client_op_id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const op: PendingOperation = {
      id: client_op_id,
      client_op_id,
      table,
      operation,
      data: { ...data, client_op_id },
      timestamp: Date.now()
    };
    
    savePendingOperation(op);
    return client_op_id;
  }, []);

  return {
    pendingOps,
    issyncing,
    queueOperation,
    syncPendingOperations
  };
}