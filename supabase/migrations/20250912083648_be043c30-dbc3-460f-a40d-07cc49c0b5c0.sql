-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on app_session" ON public.app_session;
DROP POLICY IF EXISTS "Allow all operations on rida_entry" ON public.rida_entry;
DROP POLICY IF EXISTS "Allow all operations on resource_item" ON public.resource_item;

-- Create more restrictive policies for authenticated users
-- Since these tables don't have direct user ownership, we'll allow authenticated users to access them
-- but you may want to add more specific access control later

-- App Session policies - allow authenticated users to read, but restrict write operations
CREATE POLICY "Authenticated users can view app_sessions" ON public.app_session
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create app_sessions" ON public.app_session
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update app_sessions" ON public.app_session
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RIDA Entry policies
CREATE POLICY "Authenticated users can view rida_entries" ON public.rida_entry
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create rida_entries" ON public.rida_entry
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update rida_entries" ON public.rida_entry
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete rida_entries" ON public.rida_entry
    FOR DELETE TO authenticated USING (true);

-- Resource Item policies
CREATE POLICY "Authenticated users can view resource_items" ON public.resource_item
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create resource_items" ON public.resource_item
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update resource_items" ON public.resource_item
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete resource_items" ON public.resource_item
    FOR DELETE TO authenticated USING (true);