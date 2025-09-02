-- Create app_state table for storing session state
CREATE TABLE public.app_state (
  session_id UUID PRIMARY KEY,
  state JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on app_state table
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy that allows everything for anon role
CREATE POLICY "Allow all operations on app_state" ON public.app_state
FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for resources (if not exists)
INSERT INTO storage.buckets (id, name, public) 
SELECT 'resources', 'resources', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'resources');

-- Create storage policies for resources bucket
CREATE POLICY "Allow all operations on resources bucket" 
ON storage.objects FOR ALL 
USING (bucket_id = 'resources') 
WITH CHECK (bucket_id = 'resources');

-- Create trigger for updating timestamps on app_state
CREATE TRIGGER update_app_state_updated_at
  BEFORE UPDATE ON public.app_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();