-- Update existing status values to French format
UPDATE rida_entry SET status = 'À initier' WHERE status = 'nouveau';
UPDATE rida_entry SET status = 'En cours' WHERE status = 'en_cours';
UPDATE rida_entry SET status = 'Clos' WHERE status = 'clos';

-- Now update the constraint to allow French status values
ALTER TABLE rida_entry DROP CONSTRAINT rida_entry_status_check;
ALTER TABLE rida_entry ADD CONSTRAINT rida_entry_status_check 
CHECK (status IN ('À initier', 'En cours', 'Clos'));