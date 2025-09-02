-- Create enum types
CREATE TYPE public.session_mode AS ENUM ('exercise', 'real');
CREATE TYPE public.session_severity AS ENUM ('low', 'moderate', 'high', 'critical');
CREATE TYPE public.action_priority AS ENUM ('low', 'med', 'high');
CREATE TYPE public.action_status AS ENUM ('todo', 'doing', 'done');
CREATE TYPE public.journal_category AS ENUM ('detection', 'containment', 'eradication', 'recovery', 'communication', 'decision', 'legal', 'incident', 'action', 'note');
CREATE TYPE public.resource_kind AS ENUM ('file', 'link');
CREATE TYPE public.audit_operation AS ENUM ('create', 'update', 'delete');
CREATE TYPE public.audit_entity AS ENUM ('journal', 'action', 'decision', 'comm', 'resource');

-- Sessions table
CREATE TABLE public.sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    mode session_mode NOT NULL,
    severity session_severity NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Participants table
CREATE TABLE public.participants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    display_name TEXT NOT NULL,
    role TEXT,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    presence JSONB DEFAULT '{}',
    UNIQUE(session_id, user_id)
);

-- Journal events table
CREATE TABLE public.journal_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    category journal_category NOT NULL,
    title TEXT NOT NULL,
    details TEXT,
    by_user TEXT,
    attachments JSONB DEFAULT '[]',
    at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    client_op_id TEXT
);

-- Actions table
CREATE TABLE public.actions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    owner TEXT,
    priority action_priority DEFAULT 'med',
    status action_status DEFAULT 'todo',
    due_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    client_op_id TEXT
);

-- Decisions table
CREATE TABLE public.decisions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_chosen TEXT NOT NULL,
    rationale TEXT,
    validator TEXT,
    decided_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    related_action_ids UUID[] DEFAULT ARRAY[]::UUID[],
    related_journal_ids UUID[] DEFAULT ARRAY[]::UUID[],
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    client_op_id TEXT
);

-- Communications table
CREATE TABLE public.communications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    audience TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    author TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    client_op_id TEXT
);

-- Resources table
CREATE TABLE public.resources (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    kind resource_kind NOT NULL,
    title TEXT NOT NULL,
    url TEXT,
    blob_key TEXT,
    mime_type TEXT,
    size_bytes BIGINT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    note TEXT,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    added_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    client_op_id TEXT
);

-- Audit log table
CREATE TABLE public.audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    entity audit_entity NOT NULL,
    entity_id UUID NOT NULL,
    operation audit_operation NOT NULL,
    before_data JSONB,
    after_data JSONB,
    by_user TEXT,
    at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view sessions they participate in" ON public.sessions
FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = sessions.id AND user_id = auth.uid())
);

CREATE POLICY "Users can create sessions" ON public.sessions
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Session creators can update their sessions" ON public.sessions
FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for participants
CREATE POLICY "Users can view participants in their sessions" ON public.participants
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sessions WHERE id = participants.session_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.participants p2 WHERE p2.session_id = participants.session_id AND p2.user_id = auth.uid())))
);

CREATE POLICY "Users can join sessions" ON public.participants
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON public.participants
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for journal_events
CREATE POLICY "Users can view journal events in their sessions" ON public.journal_events
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = journal_events.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can create journal events in their sessions" ON public.journal_events
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = journal_events.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can update journal events in their sessions" ON public.journal_events
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = journal_events.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can delete journal events in their sessions" ON public.journal_events
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = journal_events.session_id AND user_id = auth.uid())
);

-- RLS Policies for actions
CREATE POLICY "Users can view actions in their sessions" ON public.actions
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = actions.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can create actions in their sessions" ON public.actions
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = actions.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can update actions in their sessions" ON public.actions
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = actions.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can delete actions in their sessions" ON public.actions
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = actions.session_id AND user_id = auth.uid())
);

-- RLS Policies for decisions
CREATE POLICY "Users can view decisions in their sessions" ON public.decisions
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = decisions.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can create decisions in their sessions" ON public.decisions
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = decisions.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can update decisions in their sessions" ON public.decisions
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = decisions.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can delete decisions in their sessions" ON public.decisions
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = decisions.session_id AND user_id = auth.uid())
);

-- RLS Policies for communications
CREATE POLICY "Users can view communications in their sessions" ON public.communications
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = communications.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can create communications in their sessions" ON public.communications
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = communications.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can update communications in their sessions" ON public.communications
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = communications.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can delete communications in their sessions" ON public.communications
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = communications.session_id AND user_id = auth.uid())
);

-- RLS Policies for resources
CREATE POLICY "Users can view resources in their sessions" ON public.resources
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = resources.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can create resources in their sessions" ON public.resources
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = resources.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can update resources in their sessions" ON public.resources
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = resources.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can delete resources in their sessions" ON public.resources
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = resources.session_id AND user_id = auth.uid())
);

-- RLS Policies for audit_log
CREATE POLICY "Users can view audit logs in their sessions" ON public.audit_log
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = audit_log.session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can create audit logs in their sessions" ON public.audit_log
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.participants WHERE session_id = audit_log.session_id AND user_id = auth.uid())
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_events_updated_at BEFORE UPDATE ON public.journal_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON public.actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_decisions_updated_at BEFORE UPDATE ON public.decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_communications_updated_at BEFORE UPDATE ON public.communications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.journal_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.actions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.decisions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.communications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;

-- Indexes for performance
CREATE INDEX idx_participants_session_id ON public.participants(session_id);
CREATE INDEX idx_participants_user_id ON public.participants(user_id);
CREATE INDEX idx_journal_events_session_id ON public.journal_events(session_id);
CREATE INDEX idx_journal_events_at ON public.journal_events(at DESC);
CREATE INDEX idx_actions_session_id ON public.actions(session_id);
CREATE INDEX idx_actions_status ON public.actions(status);
CREATE INDEX idx_decisions_session_id ON public.decisions(session_id);
CREATE INDEX idx_communications_session_id ON public.communications(session_id);
CREATE INDEX idx_resources_session_id ON public.resources(session_id);
CREATE INDEX idx_audit_log_session_id ON public.audit_log(session_id);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity, entity_id);