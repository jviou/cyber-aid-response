import { useState, useEffect, useMemo } from 'react';
import { usePhases } from './usePhases';

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
  const { phases, loading, error, updateChecklistItem } = usePhases(sessionId);
  
  const phasesProgress = useMemo(() => {
    return phases.map(phase => {
      const strategicItems = phase.strategic_checklist || [];
      const operationalItems = phase.operational_checklist || [];
      
      const strategicCompleted = strategicItems.filter(item => item.completed).length;
      const operationalCompleted = operationalItems.filter(item => item.completed).length;
      
      const totalStrategic = strategicItems.length;
      const totalOperational = operationalItems.length;
      const totalItems = totalStrategic + totalOperational;
      const completedItems = strategicCompleted + operationalCompleted;
      
      const strategic_progress = totalStrategic > 0 ? Math.round((strategicCompleted / totalStrategic) * 100) : 0;
      const operational_progress = totalOperational > 0 ? Math.round((operationalCompleted / totalOperational) * 100) : 0;
      const overall_progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      
      return {
        id: phase.id,
        order_index: phase.order_index,
        code: phase.code,
        title: phase.title,
        subtitle: phase.subtitle,
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
    loading,
    error,
    updateChecklistItem
  };
}