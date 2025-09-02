-- Add checklist columns to phases table
ALTER TABLE phases ADD COLUMN IF NOT EXISTS strategic_checklist jsonb DEFAULT '[]'::jsonb;
ALTER TABLE phases ADD COLUMN IF NOT EXISTS operational_checklist jsonb DEFAULT '[]'::jsonb;

-- Insert the 4 crisis management phases with their checklists
INSERT INTO phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist) 
SELECT 
  s.id as session_id,
  1 as order_index,
  'P1' as code,
  'Alerter et endiguer' as title,
  'Mobiliser' as subtitle,
  '[
    {"id": "p1s1", "text": "Mobiliser la cellule de crise", "completed": false},
    {"id": "p1s2", "text": "Prise en compte de la fiche réflexe et 1ère action effectuée", "completed": false},
    {"id": "p1s3", "text": "État des lieux", "completed": false},
    {"id": "p1s4", "text": "Suivi des actions", "completed": false}
  ]'::jsonb as strategic_checklist,
  '[
    {"id": "p1o1", "text": "Prévenir prestataires sécurité", "completed": false},
    {"id": "p1o2", "text": "Fiche réflexe CYBER", "completed": false},
    {"id": "p1o3", "text": "Suivi des actions", "completed": false}
  ]'::jsonb as operational_checklist
FROM sessions s
WHERE NOT EXISTS (
  SELECT 1 FROM phases p WHERE p.session_id = s.id AND p.order_index = 1
);

INSERT INTO phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist) 
SELECT 
  s.id as session_id,
  2 as order_index,
  'P2' as code,
  'Comprendre l''attaque' as title,
  'Maintenir la confiance' as subtitle,
  '[
    {"id": "p2s1", "text": "Communication externe", "completed": false},
    {"id": "p2s2", "text": "Arbitrage applicatifs métiers", "completed": false},
    {"id": "p2s3", "text": "Mise en place du mode dégradé", "completed": false}
  ]'::jsonb as strategic_checklist,
  '[
    {"id": "p2o1", "text": "Identification de l''attaque", "completed": false},
    {"id": "p2o2", "text": "Vérification des sauvegardes saines", "completed": false},
    {"id": "p2o3", "text": "Solutions de contournement pour applications critiques", "completed": false}
  ]'::jsonb as operational_checklist
FROM sessions s
WHERE NOT EXISTS (
  SELECT 1 FROM phases p WHERE p.session_id = s.id AND p.order_index = 2
);

INSERT INTO phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist) 
SELECT 
  s.id as session_id,
  3 as order_index,
  'P3' as code,
  'Durcir et surveiller' as title,
  'Relancer les activités' as subtitle,
  '[
    {"id": "p3s1", "text": "Déclenchement du PRA", "completed": false},
    {"id": "p3s2", "text": "Prioriser les applications et services critiques à relancer", "completed": false},
    {"id": "p3s3", "text": "Validation de sortie de crise", "completed": false}
  ]'::jsonb as strategic_checklist,
  '[
    {"id": "p3o1", "text": "Activation du PRI", "completed": false},
    {"id": "p3o2", "text": "Reconstruction de l''infra", "completed": false},
    {"id": "p3o3", "text": "Évaluation des « dégâts »", "completed": false},
    {"id": "p3o4", "text": "Test pour validation sortie de crise", "completed": false}
  ]'::jsonb as operational_checklist
FROM sessions s
WHERE NOT EXISTS (
  SELECT 1 FROM phases p WHERE p.session_id = s.id AND p.order_index = 3
);

INSERT INTO phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist) 
SELECT 
  s.id as session_id,
  4 as order_index,
  'P4' as code,
  'Capitaliser' as title,
  'Tirer les leçons de la crise' as subtitle,
  '[
    {"id": "p4s1", "text": "Communiquer sur la sortie de crise", "completed": false},
    {"id": "p4s2", "text": "Plan d''action sur les tâches à mener", "completed": false},
    {"id": "p4s3", "text": "Retour d''expérience", "completed": false},
    {"id": "p4s4", "text": "Formation et sensibilisation utilisateur", "completed": false}
  ]'::jsonb as strategic_checklist,
  '[]'::jsonb as operational_checklist
FROM sessions s
WHERE NOT EXISTS (
  SELECT 1 FROM phases p WHERE p.session_id = s.id AND p.order_index = 4
);