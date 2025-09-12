import { createClient } from '@supabase/supabase-js'

// Vite expose import.meta.env en runtime du bundle
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env manquantes. Vérifie VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
