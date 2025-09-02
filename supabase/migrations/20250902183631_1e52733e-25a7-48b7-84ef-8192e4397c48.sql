-- Relax RLS on resources to allow anonymous usage per app requirements
DO $$
BEGIN
  -- Enable RLS if not already
  ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Create a permissive policy that allows anyone to read/write resources
DROP POLICY IF EXISTS resources_anon_all ON public.resources;
CREATE POLICY resources_anon_all
ON public.resources
AS PERMISSIVE
FOR ALL
TO public
USING (true)
WITH CHECK (true);
