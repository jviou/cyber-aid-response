
import { useState, useEffect } from 'react';

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
    // Local only - no backend
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;

    const updatedChecklist = checklistType === 'strategic' 
      ? phase.strategic_checklist.map(item => item.id === itemId ? { ...item, completed } : item)
      : phase.operational_checklist.map(item => item.id === itemId ? { ...item, completed } : item);

    setPhases(prevPhases => 
      prevPhases.map(p => 
        p.id === phaseId 
          ? { ...p, [checklistType + '_checklist']: updatedChecklist }
          : p
      )
    );
  };

  useEffect(() => {
    // No backend - return empty phases
    setPhases([]);
    setLoading(false);
  }, [sessionId]);

  return { phases, loading, error, updateChecklistItem };
}
