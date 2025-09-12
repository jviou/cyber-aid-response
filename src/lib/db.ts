import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { getDefaultSessionId } from './defaultSession';

// Supabase client configuration
const SUPABASE_URL = "https://xlzfvgqfopdlvrolorba.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsemZ2Z3Fmb3BkbHZyb2xvcmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2OTQ3NDgsImV4cCI6MjA3MjI3MDc0OH0.gCnOE4qaLfzt4B4grx2dM0LGQRwqX--DNRtWKwRwG5g";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Get default session ID
let cachedDefaultSessionId: string | null = null;

export const DEFAULT_SESSION_ID = async (): Promise<string> => {
  if (!cachedDefaultSessionId) {
    cachedDefaultSessionId = await getDefaultSessionId();
  }
  return cachedDefaultSessionId;
};

// Save RIDA entry
export async function saveRida(entry: Omit<Database['public']['Tables']['rida_entry']['Insert'], 'session_id' | 'updated_at'>) {
  const sessionId = await DEFAULT_SESSION_ID();
  
  const { data, error } = await supabase
    .from('rida_entry')
    .upsert({
      ...entry,
      session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erreur lors de la sauvegarde RIDA: ${error.message}`);
  }

  return data;
}

// Save resource item
export async function saveResource(item: Omit<Database['public']['Tables']['resource_item']['Insert'], 'session_id' | 'updated_at'>) {
  const sessionId = await DEFAULT_SESSION_ID();
  
  const { data, error } = await supabase
    .from('resource_item')
    .upsert({
      ...item,
      session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erreur lors de la sauvegarde de la ressource: ${error.message}`);
  }

  return data;
}

// Fetch KPIs for default session
export async function fetchKpis() {
  const sessionId = await DEFAULT_SESSION_ID();
  
  const { data, error } = await supabase
    .from('dashboard_kpis')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Erreur lors de la récupération des KPIs: ${error.message}`);
  }

  // Return default values if no data found
  return {
    rida_total: data?.rida_total || 0,
    rida_en_cours: data?.rida_en_cours || 0,
    rida_clos: data?.rida_clos || 0,
    ressources_total: data?.ressources_total || 0,
  };
}