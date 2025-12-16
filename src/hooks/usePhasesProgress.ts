import { useMemo } from 'react';
import { useCrisisState } from './useCrisisState'; // Use Real State

interface PhaseProgress {
  id: string;
  order_index: number;
  code: string;
  title: string;
  subtitle?: string;
  strategic_progress: number;
  operational_progress: number;
  overall_progress: number;
  completed_items: number;
  total_items: number;
}

export function usePhasesProgress(sessionId: string) {
  // Directly use the real state, ignore legacy usePhases mock
  const { state } = useCrisisState();
  const phases = state.phases || [];

  const phasesProgress = useMemo(() => {
    return phases.map((phase, index) => {
      // Correctly access nested checklist
      const strategicItems = phase.checklist?.strategic || [];
      const operationalItems = phase.checklist?.operational || [];

      const strategicCompleted = strategicItems.filter((item: any) => item.checked).length;
      const operationalCompleted = operationalItems.filter((item: any) => item.checked).length;

      const totalStrategic = strategicItems.length;
      const totalOperational = operationalItems.length;
      const totalItems = totalStrategic + totalOperational;
      const completedItems = strategicCompleted + operationalCompleted;

      const strategic_progress = totalStrategic > 0 ? Math.round((strategicCompleted / totalStrategic) * 100) : 0;
      const operational_progress = totalOperational > 0 ? Math.round((operationalCompleted / totalOperational) * 100) : 0;
      const overall_progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        id: phase.id,
        order_index: index + 1, // Fallback if no order_index
        code: phase.id, // ID is P1, P2 etc
        title: phase.title,
        subtitle: (phase as any).subtitle || "", // Cast if subtitle missing in types
        strategic_progress,
        operational_progress,
        overall_progress,
        completed_items: completedItems,
        total_items: totalItems
      } as PhaseProgress;
    });
  }, [phases]);

  const globalProgress = useMemo(() => {
    if (phasesProgress.length === 0) return 0;

    const totalItems = phasesProgress.reduce((acc, phase) => acc + phase.total_items, 0);
    const completedItems = phasesProgress.reduce((acc, phase) => acc + phase.completed_items, 0);

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [phasesProgress]);

  return {
    phases: phasesProgress,
    globalProgress,
    loading: false, // Always ready with useCrisisState
    error: null,
    updateChecklistItem: () => console.warn("Use updateState from useCrisisState instead")
  };
}