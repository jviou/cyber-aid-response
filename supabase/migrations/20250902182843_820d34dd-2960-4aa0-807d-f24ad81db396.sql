-- Seed default phases for existing sessions that don't have phases yet
INSERT INTO public.phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist)
SELECT DISTINCT s.id, 1, 'P1', 'Phase 1', 'Mobiliser', '[]'::jsonb, '[]'::jsonb
FROM public.sessions s 
WHERE NOT EXISTS (
  SELECT 1 FROM public.phases p WHERE p.session_id = s.id AND p.order_index = 1
);

INSERT INTO public.phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist)
SELECT DISTINCT s.id, 2, 'P2', 'Phase 2', 'Confiance', '[]'::jsonb, '[]'::jsonb
FROM public.sessions s 
WHERE NOT EXISTS (
  SELECT 1 FROM public.phases p WHERE p.session_id = s.id AND p.order_index = 2
);

INSERT INTO public.phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist)
SELECT DISTINCT s.id, 3, 'P3', 'Phase 3', 'Relancer', '[]'::jsonb, '[]'::jsonb
FROM public.sessions s 
WHERE NOT EXISTS (
  SELECT 1 FROM public.phases p WHERE p.session_id = s.id AND p.order_index = 3
);

INSERT INTO public.phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist)
SELECT DISTINCT s.id, 4, 'P4', 'Phase 4', 'Capitaliser', '[]'::jsonb, '[]'::jsonb
FROM public.sessions s 
WHERE NOT EXISTS (
  SELECT 1 FROM public.phases p WHERE p.session_id = s.id AND p.order_index = 4
);