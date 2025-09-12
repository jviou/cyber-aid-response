-- Update the status check constraint to allow French status values
ALTER TABLE rida_entry DROP CONSTRAINT rida_entry_status_check;

-- Add new constraint with correct French status values
ALTER TABLE rida_entry ADD CONSTRAINT rida_entry_status_check 
CHECK (status IN ('À initier', 'En cours', 'Clos'));