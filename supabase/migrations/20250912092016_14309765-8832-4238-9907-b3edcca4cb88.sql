-- Add type and due_date columns to rida_entry table
ALTER TABLE public.rida_entry 
ADD COLUMN type text DEFAULT 'I',
ADD COLUMN due_date timestamp with time zone;