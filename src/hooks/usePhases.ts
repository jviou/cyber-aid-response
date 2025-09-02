
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Phase {
  id: string;
  session_id: string;
  order_index: number;
  code: string;
  title: string;
  subtitle?: string;
  created_at: string;
  strategic_checklist: ChecklistItem[];
  operational_checklist: ChecklistItem[];
}

export function usePhases(sessionId: string) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateChecklistItem = async (phaseId: string, checklistType: 'strategic' | 'operational', itemId: string, completed: boolean) => {
    try {
      const phase = phases.find(p => p.id === phaseId);
      if (!phase) return;

      const updatedChecklist = checklistType === 'strategic' 
        ? phase.strategic_checklist.map(item => item.id === itemId ? { ...item, completed } : item)
        : phase.operational_checklist.map(item => item.id === itemId ? { ...item, completed } : item);

      const updateData = checklistType === 'strategic' 
        ? { strategic_checklist: updatedChecklist as any }
        : { operational_checklist: updatedChecklist as any };

      const { error } = await supabase
        .from('phases')
        .update(updateData)
        .eq('id', phaseId);

      if (error) throw error;

      // Update local state
      setPhases(prevPhases => 
        prevPhases.map(p => 
          p.id === phaseId 
            ? { ...p, [checklistType + '_checklist']: updatedChecklist }
            : p
        )
      );
    } catch (err) {
      console.error('Error updating checklist item:', err);
    }
  };

  useEffect(() => {
    const fetchPhases = async () => {
      if (!sessionId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('phases')
          .select('*')
          .eq('session_id', sessionId)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error fetching phases:', error);
          setError(error.message);
          return;
        }

        const formattedPhases = (data || []).map(phase => ({
          ...phase,
          strategic_checklist: Array.isArray(phase.strategic_checklist) ? phase.strategic_checklist as unknown as ChecklistItem[] : [],
          operational_checklist: Array.isArray(phase.operational_checklist) ? phase.operational_checklist as unknown as ChecklistItem[] : []
        }));

        setPhases(formattedPhases as unknown as Phase[]);
      } catch (err) {
        console.error('Error fetching phases:', err);
        setError('Erreur lors du chargement des phases');
      } finally {
        setLoading(false);
      }
    };

    fetchPhases();
  }, [sessionId]);

  return { phases, loading, error, updateChecklistItem };
}
