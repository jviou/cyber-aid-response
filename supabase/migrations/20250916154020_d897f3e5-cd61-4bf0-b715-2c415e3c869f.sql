-- Fix security vulnerability: Replace overly permissive RLS policies on app_state table
-- Drop the dangerous "allow all" policy
DROP POLICY IF EXISTS "Allow all operations on app_state" ON public.app_state;

-- Create secure RLS policies that restrict access to session participants only
CREATE POLICY "Users can view app_state for their sessions" 
ON public.app_state 
FOR SELECT 
USING (is_member(session_id));

CREATE POLICY "Users can insert app_state for their sessions" 
ON public.app_state 
FOR INSERT 
WITH CHECK (is_member(session_id));

CREATE POLICY "Users can update app_state for their sessions" 
ON public.app_state 
FOR UPDATE 
USING (is_member(session_id))
WITH CHECK (is_member(session_id));

CREATE POLICY "Users can delete app_state for their sessions" 
ON public.app_state 
FOR DELETE 
USING (is_member(session_id));