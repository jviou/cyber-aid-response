-- Create app_state table for storing session state
CREATE TABLE public.app_state (
  session_id UUID PRIMARY KEY,
  state JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create resources table for file metadata
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on tables
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies that allow everything for anon role
CREATE POLICY "Allow all operations on app_state" ON public.app_state
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on resources" ON public.resources
FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Create storage policies for resources bucket
CREATE POLICY "Allow all operations on resources bucket" 
ON storage.objects FOR ALL 
USING (bucket_id = 'resources') 
WITH CHECK (bucket_id = 'resources');

-- Create trigger for updating timestamps
CREATE TRIGGER update_app_state_updated_at
  BEFORE UPDATE ON public.app_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();