import { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOfflineSync } from './useOfflineSync';
import { useNetworkStatus } from './useNetworkStatus';
import type { 
  Session, 
  JournalEvent, 
  ActionItem, 
  Decision, 
  Communication, 
  Resource, 
  Participant 
} from '@/types/database';

interface SessionData {
  session: Session | null;
  participants: Participant[];
  journalEvents: JournalEvent[];
  actions: ActionItem[];
  decisions: Decision[];
  communications: Communication[];
  resources: Resource[];
  loading: boolean;
}

export function useRealtimeSession(sessionId: string) {
  const { user } = useAuth();
  const { queueOperation } = useOfflineSync();
  const isOnline = useNetworkStatus();
  
  const [data, setData] = useState<SessionData>({
    session: null,
    participants: [],
    journalEvents: [],
    actions: [],
    decisions: [],
    communications: [],
    resources: [],
    loading: true
  });

  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (!sessionId || !user) return;

    try {
      const [
        sessionResult,
        participantsResult,
        journalResult,
        actionsResult,
        decisionsResult,
        commsResult,
        resourcesResult
      ] = await Promise.all([
        supabase.from('sessions').select('*').eq('id', sessionId).maybeSingle(),
        supabase.from('participants').select('*').eq('session_id', sessionId),
        supabase.from('journal_events').select('*').eq('session_id', sessionId).order('at', { ascending: false }),
        supabase.from('actions').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }),
        supabase.from('decisions').select('*').eq('session_id', sessionId).order('decided_at', { ascending: false }),
        supabase.from('communications').select('*').eq('session_id', sessionId).order('updated_at', { ascending: false }),
        supabase.from('resources').select('*').eq('session_id', sessionId).order('added_at', { ascending: false })
      ]);

      setData({
        session: sessionResult.data,
        participants: participantsResult.data || [],
        journalEvents: (journalResult.data || []) as JournalEvent[],
        actions: (actionsResult.data || []) as ActionItem[],
        decisions: (decisionsResult.data || []) as Decision[],
        communications: (commsResult.data || []) as Communication[],
        resources: (resourcesResult.data || []) as Resource[],
        loading: false
      });
    } catch (error) {
      console.error('Error loading session data:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [sessionId, user]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!sessionId || !user || !isOnline) return;

    const newChannel = supabase.channel(`session-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'journal_events',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setData(prev => {
          switch (payload.eventType) {
            case 'INSERT':
              return { ...prev, journalEvents: [payload.new as JournalEvent, ...prev.journalEvents] };
            case 'UPDATE':
              return { 
                ...prev, 
                journalEvents: prev.journalEvents.map(item => 
                  item.id === payload.new.id ? payload.new as JournalEvent : item
                )
              };
            case 'DELETE':
              return { 
                ...prev, 
                journalEvents: prev.journalEvents.filter(item => item.id !== payload.old.id)
              };
            default:
              return prev;
          }
        });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'actions',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setData(prev => {
          switch (payload.eventType) {
            case 'INSERT':
              return { ...prev, actions: [payload.new as ActionItem, ...prev.actions] };
            case 'UPDATE':
              return { 
                ...prev, 
                actions: prev.actions.map(item => 
                  item.id === payload.new.id ? payload.new as ActionItem : item
                )
              };
            case 'DELETE':
              return { 
                ...prev, 
                actions: prev.actions.filter(item => item.id !== payload.old.id)
              };
            default:
              return prev;
          }
        });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setData(prev => {
          switch (payload.eventType) {
            case 'INSERT':
              return { ...prev, participants: [...prev.participants, payload.new as Participant] };
            case 'UPDATE':
              return { 
                ...prev, 
                participants: prev.participants.map(item => 
                  item.id === payload.new.id ? payload.new as Participant : item
                )
              };
            case 'DELETE':
              return { 
                ...prev, 
                participants: prev.participants.filter(item => item.id !== payload.old.id)
              };
            default:
              return prev;
          }
        });
      })
      .subscribe();

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [sessionId, user, isOnline]);

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // CRUD operations with offline support
  const createJournalEvent = useCallback(async (eventData: Omit<JournalEvent, 'id' | 'session_id' | 'updated_at' | 'client_op_id'>) => {
    const newEvent = {
      ...eventData,
      session_id: sessionId,
      updated_at: new Date().toISOString(),
      attachments: eventData.attachments || []
    };

    if (isOnline) {
      try {
        const { data, error } = await supabase.from('journal_events').insert(newEvent).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating journal event:', error);
        queueOperation('journal_events', 'insert', newEvent);
      }
    } else {
      queueOperation('journal_events', 'insert', newEvent);
    }
  }, [sessionId, isOnline, queueOperation]);

  const createAction = useCallback(async (actionData: Omit<ActionItem, 'id' | 'session_id' | 'created_at' | 'updated_at' | 'client_op_id'>) => {
    const newAction = {
      ...actionData,
      session_id: sessionId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isOnline) {
      try {
        const { data, error } = await supabase.from('actions').insert(newAction).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating action:', error);
        queueOperation('actions', 'insert', newAction);
      }
    } else {
      queueOperation('actions', 'insert', newAction);
    }
  }, [sessionId, isOnline, queueOperation]);

  const updateAction = useCallback(async (id: string, updates: Partial<ActionItem>) => {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (isOnline) {
      try {
        const { error } = await supabase.from('actions').update(updateData).eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error('Error updating action:', error);
        queueOperation('actions', 'update', { id, ...updateData });
      }
    } else {
      queueOperation('actions', 'update', { id, ...updateData });
    }
  }, [isOnline, queueOperation]);

  const joinSession = useCallback(async (displayName: string, role?: string) => {
    if (!user) return;

    const participantData = {
      session_id: sessionId,
      user_id: user.id,
      display_name: displayName,
      role: role || '',
      joined_at: new Date().toISOString()
    };

    if (isOnline) {
      try {
        const { data, error } = await supabase.from('participants').upsert(participantData).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error joining session:', error);
        queueOperation('participants', 'insert', participantData);
      }
    } else {
      queueOperation('participants', 'insert', participantData);
    }
  }, [sessionId, user, isOnline, queueOperation]);

  return {
    ...data,
    createJournalEvent,
    createAction,
    updateAction,
    joinSession,
    refetch: loadInitialData
  };
}