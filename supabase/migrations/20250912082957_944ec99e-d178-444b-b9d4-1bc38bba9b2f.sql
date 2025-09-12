-- Create app_session table
CREATE TABLE public.app_session (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rida_entry table
CREATE TABLE public.rida_entry (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.app_session(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_cours', 'clos')),
    owner TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resource_item table
CREATE TABLE public.resource_item (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.app_session(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    location TEXT,
    contact TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.app_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rida_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_item ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since this seems to be a public-facing app)
CREATE POLICY "Allow all operations on app_session" ON public.app_session
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on rida_entry" ON public.rida_entry
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on resource_item" ON public.resource_item
    FOR ALL USING (true) WITH CHECK (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_rida_entry_updated_at
    BEFORE UPDATE ON public.rida_entry
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resource_item_updated_at
    BEFORE UPDATE ON public.resource_item
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create dashboard_kpis view
CREATE OR REPLACE VIEW public.dashboard_kpis AS
SELECT 
    s.id as session_id,
    s.label as session_label,
    COALESCE(r.rida_total, 0) as rida_total,
    COALESCE(r.rida_en_cours, 0) as rida_en_cours,
    COALESCE(r.rida_clos, 0) as rida_clos,
    COALESCE(res.ressources_total, 0) as ressources_total
FROM public.app_session s
LEFT JOIN (
    SELECT 
        session_id,
        COUNT(*) as rida_total,
        COUNT(*) FILTER (WHERE status = 'en_cours') as rida_en_cours,
        COUNT(*) FILTER (WHERE status = 'clos') as rida_clos
    FROM public.rida_entry
    GROUP BY session_id
) r ON s.id = r.session_id
LEFT JOIN (
    SELECT 
        session_id,
        COUNT(*) as ressources_total
    FROM public.resource_item
    GROUP BY session_id
) res ON s.id = res.session_id;

-- Insert default session
INSERT INTO public.app_session (label, is_active, started_at)
VALUES ('session_par_defaut', true, now());

-- Enable realtime for tables
ALTER TABLE public.rida_entry REPLICA IDENTITY FULL;
ALTER TABLE public.resource_item REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.rida_entry;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resource_item;