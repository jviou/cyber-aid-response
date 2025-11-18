import { useCrisisSession } from "@/hooks/useCrisisSession";

export function useLocalPhases(sessionId: string) {
  const { session, updateSession } = useCrisisSession();
  
  const phases = session?.phases || [];
  const loading = false;
  const error = null;

  const updateChecklistItem = (phaseId: string, type: 'strategic' | 'operational', itemId: string, completed: boolean) => {
    updateSession(session => ({
      ...session,
      phases: session.phases.map(phase => 
        phase.id === phaseId 
          ? {
              ...phase,
              checklist: {
                ...phase.checklist,
                [type]: phase.checklist[type].map(item =>
                  item.id === itemId ? { ...item, status: completed ? 'done' : 'todo' } : item
                )
              }
            }
          : phase
      )
    }));
  };

  return {
    phases,
    loading,
    error,
    updateChecklistItem
  };
}