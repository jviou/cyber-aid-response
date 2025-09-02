-- Update phases with the correct checklists
-- First, clear existing phases to avoid duplicates
DELETE FROM phases;

-- Insert Phase 1 - Alerter et Endiguer (Mobiliser)
INSERT INTO phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist)
SELECT 
  s.id as session_id,
  1 as order_index,
  'PHASE1' as code,
  'Alerter et Endiguer' as title,
  'Mobiliser' as subtitle,
  '[
    {"id": "s1_1", "text": "Mobiliser la cellule de crise", "completed": false},
    {"id": "s1_2", "text": "Prise en compte de la fiche réflexe et 1ère action effectuée", "completed": false},
    {"id": "s1_3", "text": "État des lieux", "completed": false},
    {"id": "s1_4", "text": "Suivi des actions", "completed": false}
  ]'::jsonb as strategic_checklist,
  '[
    {"id": "o1_1", "text": "Prévenir prestataires sécurité", "completed": false},
    {"id": "o1_2", "text": "Fiche réflexe CYBER", "completed": false},
    {"id": "o1_3", "text": "Suivi des actions", "completed": false}
  ]'::jsonb as operational_checklist
FROM sessions s;

-- Insert Phase 2 - Comprendre l'attaque (Maintenir la confiance)
INSERT INTO phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist)
SELECT 
  s.id as session_id,
  2 as order_index,
  'PHASE2' as code,
  'Comprendre l''attaque' as title,
  'Maintenir la confiance' as subtitle,
  '[
    {"id": "s2_1", "text": "Communication externe", "completed": false},
    {"id": "s2_2", "text": "Arbitrage applicatifs métiers", "completed": false},
    {"id": "s2_3", "text": "Mise en place du mode dégradé", "completed": false}
  ]'::jsonb as strategic_checklist,
  '[
    {"id": "o2_1", "text": "Identification de l''attaque", "completed": false},
    {"id": "o2_2", "text": "Vérification des sauvegardes saines", "completed": false},
    {"id": "o2_3", "text": "Solutions de contournement pour applications critiques", "completed": false}
  ]'::jsonb as operational_checklist
FROM sessions s;

-- Insert Phase 3 - Durcir et Surveiller (Relancer les activités)
INSERT INTO phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist)
SELECT 
  s.id as session_id,
  3 as order_index,
  'PHASE3' as code,
  'Durcir et Surveiller' as title,
  'Relancer les activités' as subtitle,
  '[
    {"id": "s3_1", "text": "Déclenchement du PRA", "completed": false},
    {"id": "s3_2", "text": "Prioriser les applications et services critiques à relancer", "completed": false},
    {"id": "s3_3", "text": "Validation de sortie de crise", "completed": false}
  ]'::jsonb as strategic_checklist,
  '[
    {"id": "o3_1", "text": "Activation du PRA", "completed": false},
    {"id": "o3_2", "text": "Reconstruction de l''infra", "completed": false},
    {"id": "o3_3", "text": "Évaluation des \"dégâts\"", "completed": false},
    {"id": "o3_4", "text": "Test pour validation sortie de crise", "completed": false}
  ]'::jsonb as operational_checklist
FROM sessions s;

-- Insert Phase 4 - Capitaliser (Tirer les leçons de la crise)
INSERT INTO phases (session_id, order_index, code, title, subtitle, strategic_checklist, operational_checklist)
SELECT 
  s.id as session_id,
  4 as order_index,
  'PHASE4' as code,
  'Capitaliser' as title,
  'Tirer les leçons de la crise' as subtitle,
  '[
    {"id": "s4_1", "text": "Communiquer sur la sortie de crise", "completed": false},
    {"id": "s4_2", "text": "Plan d''action sur les tâches à mener", "completed": false},
    {"id": "s4_3", "text": "Retour d''expérience", "completed": false},
    {"id": "s4_4", "text": "Formation et sensibilisation utilisateur", "completed": false}
  ]'::jsonb as strategic_checklist,
  '[]'::jsonb as operational_checklist
FROM sessions s;