import { supabase, DEFAULT_SESSION_ID } from './db'

export function subscribeRida(onChange: () => void) {
  const channel = supabase.channel('rida-realtime')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'rida_entry', filter: `session_id=eq.${DEFAULT_SESSION_ID}` },
      () => onChange()
    )
    .subscribe()
  return () => channel.unsubscribe()
}