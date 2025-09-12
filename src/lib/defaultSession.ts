import { supabase } from "@/integrations/supabase/client";

let defaultSessionId: string | null = null;

export async function getDefaultSessionId(): Promise<string> {
  if (defaultSessionId) {
    return defaultSessionId;
  }

  const { data, error } = await supabase
    .from('app_session')
    .select('id')
    .eq('label', 'session_par_defaut')
    .single();

  if (error) {
    throw new Error(`Erreur lors de la récupération de la session par défaut: ${error.message}`);
  }

  defaultSessionId = data.id;
  return defaultSessionId;
}