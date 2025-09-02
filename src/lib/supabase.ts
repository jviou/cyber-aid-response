import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xlzfvgqfopdlvrolorba.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsemZ2Z3Fmb3BkbHZyb2xvcmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2OTQ3NDgsImV4cCI6MjA3MjI3MDc0OH0.gCnOE4qaLfzt4B4grx2dM0LGQRwqX--DNRtWKwRwG5g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);