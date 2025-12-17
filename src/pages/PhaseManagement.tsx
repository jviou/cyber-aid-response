import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Settings, Clock, Plus, Trash2 } from "lucide-react";
import { useCrisisState } from "@/hooks/useCrisisState";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PHASE_CONTENT } from "@/data/phaseContent";
import { generateSessionId } from "@/lib/stateStore";

interface PhaseManagementProps {
  sessionId: string;
}

export function PhaseManagement({ sessionId }: PhaseManagementProps) {
  const { phaseId } = useParams<{ phaseId: string }>();
  const { state, updateState } = useCrisisState();

  const phaseIndex = phaseId ? parseInt(phaseId) - 1 : 0;
  const phase = state.phases[phaseIndex];

  if (!phase) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Phase non trouvée</h2>
        <p className="text-muted-foreground">La phase demandée n'existe pas.</p>
      </div>
    );
  }


  const getPhaseNumber = (phaseId: string) => {
    switch (phaseId) {
      case 'P1': return 1;
      case 'P2': return 2;
      case 'P3': return 3;
      case 'P4': return 4;
      default: return 1;
    }
  };

  const getPhaseProgress = (phaseData: any) => {
    const strategicItems = phaseData.checklist?.strategic || [];
    const operationalItems = phaseData.checklist?.operational || [];
    const totalItems = strategicItems.length + operationalItems.length;
    const completedItems = strategicItems.filter((item: any) => item.checked).length +
      operationalItems.filter((item: any) => item.checked).length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getStrategicProgress = (phaseData: any) => {
    const strategicItems = phaseData.checklist?.strategic || [];
    const totalItems = strategicItems.length;
    const completedItems = strategicItems.filter((item: any) => item.checked).length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getOperationalProgress = (phaseData: any) => {
    const operationalItems = phaseData.checklist?.operational || [];
    const totalItems = operationalItems.length;
    const completedItems = operationalItems.filter((item: any) => item.checked).length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  return (
    <div className="bg-blue-600 min-h-screen">
      {/* Phase Header */}
      <div className="text-white p-6">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">PHASE {getPhaseNumber(phase.id)}</h1>
            <h2 className="text-xl font-semibold text-blue-100 mb-4">
              {PHASE_CONTENT[phase.id]?.title || phase.title}
            </h2>

            {PHASE_CONTENT[phase.id] && (
              <div className="text-blue-50 space-y-4 text-sm leading-relaxed">
                <p>{PHASE_CONTENT[phase.id].description}</p>
                {PHASE_CONTENT[phase.id].objectives.length > 0 && (
                  <div>
                    <p className="font-semibold mb-1">Objectifs principaux :</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {PHASE_CONTENT[phase.id].objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-right shrink-0">
            <div className="text-4xl font-bold">{Math.round(getPhaseProgress(phase))}%</div>
            <div className="text-sm text-blue-200">
              {(phase.checklist?.strategic || []).filter((item: any) => item.checked).length +
                (phase.checklist?.operational || []).filter((item: any) => item.checked).length} / {(phase.checklist?.strategic || []).length + (phase.checklist?.operational || []).length} tâches
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white mx-6 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Progression de la phase</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Stratégique: {Math.round(getStrategicProgress(phase))}%</span>
            <span>Opérationnel: {Math.round(getOperationalProgress(phase))}%</span>
          </div>
          <Progress value={getPhaseProgress(phase)} className="h-2" />
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid md:grid-cols-2 gap-6 mx-6 pb-6">
        {/* Strategic Management */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Gestion Stratégique</h3>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(getStrategicProgress(phase))}%
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {(phase.checklist?.strategic || []).filter((item: any) => item.checked).length} / {(phase.checklist?.strategic || []).length} terminées
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {(phase.checklist?.strategic || []).map((item: any) => (
              <div key={item.id} className="p-4 group">
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox
                    id={`strategic-${item.id}`}
                    checked={item.checked}
                    onCheckedChange={(checked) =>
                      updateState(prev => ({
                        ...prev,
                        phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                          ...p,
                          checklist: {
                            ...p.checklist,
                            strategic: p.checklist.strategic.map(si => si.id === item.id ? { ...si, checked: !!checked } : si)
                          }
                        } : p)
                      }))
                    }
                    className="mt-2"
                  />
                  <div className="flex-1">
                    <Input
                      value={item.text}
                      onChange={(e) =>
                        updateState(prev => ({
                          ...prev,
                          phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                            ...p,
                            checklist: {
                              ...p.checklist,
                              strategic: p.checklist.strategic.map(si => si.id === item.id ? { ...si, text: e.target.value } : si)
                            }
                          } : p)
                        }))
                      }
                      className="border-transparent hover:border-input focus:border-input px-2 h-auto py-1 font-medium text-gray-900"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 ${item.checked ? 'text-green-600' : 'text-blue-600'} shrink-0`}>
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">{item.checked ? 'Terminé' : 'À faire'}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        updateState(prev => ({
                          ...prev,
                          phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                            ...p,
                            checklist: {
                              ...p.checklist,
                              strategic: p.checklist.strategic.filter(si => si.id !== item.id)
                            }
                          } : p)
                        }))
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 ml-8">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Responsable</label>
                    <Input
                      placeholder="Nom du responsable"
                      className="text-sm h-8"
                      value={item.assignee || ''}
                      onChange={(event) =>
                        updateState(prev => ({
                          ...prev,
                          phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                            ...p,
                            checklist: {
                              ...p.checklist,
                              strategic: p.checklist.strategic.map(si => si.id === item.id ? { ...si, assignee: event.target.value } : si)
                            }
                          } : p)
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Échéance</label>
                    <Input
                      placeholder="Note ou deadline (optionnel)"
                      className="text-sm h-8"
                      value={item.dueAt || ''}
                      onChange={(event) =>
                        updateState(prev => ({
                          ...prev,
                          phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                            ...p,
                            checklist: {
                              ...p.checklist,
                              strategic: p.checklist.strategic.map(si => si.id === item.id ? { ...si, dueAt: event.target.value } : si)
                            }
                          } : p)
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 bg-gray-50">
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() =>
                  updateState(prev => ({
                    ...prev,
                    phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                      ...p,
                      checklist: {
                        ...p.checklist,
                        strategic: [
                          ...p.checklist.strategic,
                          {
                            id: generateSessionId(),
                            text: "Nouvelle tâche stratégique",
                            checked: false,
                            assignee: "",
                            dueAt: ""
                          }
                        ]
                      }
                    } : p)
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une tâche stratégique
              </Button>
            </div>
          </div>
        </div>

        {/* Operational Management */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Gestion Opérationnelle</h3>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(getOperationalProgress(phase))}%
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {(phase.checklist?.operational || []).filter((item: any) => item.checked).length} / {(phase.checklist?.operational || []).length} terminées
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {(phase.checklist?.operational || []).map((item: any) => (
              <div key={item.id} className="p-4 group">
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox
                    id={`operational-${item.id}`}
                    checked={item.checked}
                    onCheckedChange={(checked) =>
                      updateState(prev => ({
                        ...prev,
                        phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                          ...p,
                          checklist: {
                            ...p.checklist,
                            operational: p.checklist.operational.map(oi => oi.id === item.id ? { ...oi, checked: !!checked } : oi)
                          }
                        } : p)
                      }))
                    }
                    className="mt-2"
                  />
                  <div className="flex-1">
                    <Input
                      value={item.text}
                      onChange={(e) =>
                        updateState(prev => ({
                          ...prev,
                          phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                            ...p,
                            checklist: {
                              ...p.checklist,
                              operational: p.checklist.operational.map(oi => oi.id === item.id ? { ...oi, text: e.target.value } : oi)
                            }
                          } : p)
                        }))
                      }
                      className="border-transparent hover:border-input focus:border-input px-2 h-auto py-1 font-medium text-gray-900"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 ${item.checked ? 'text-green-600' : 'text-blue-600'} shrink-0`}>
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">{item.checked ? 'Terminé' : 'À faire'}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        updateState(prev => ({
                          ...prev,
                          phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                            ...p,
                            checklist: {
                              ...p.checklist,
                              operational: p.checklist.operational.filter(oi => oi.id !== item.id)
                            }
                          } : p)
                        }))
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 ml-8">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Responsable</label>
                    <Input
                      placeholder="Nom du responsable"
                      className="text-sm h-8"
                      value={item.assignee || ''}
                      onChange={(event) =>
                        updateState(prev => ({
                          ...prev,
                          phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                            ...p,
                            checklist: {
                              ...p.checklist,
                              operational: p.checklist.operational.map(oi => oi.id === item.id ? { ...oi, assignee: event.target.value } : oi)
                            }
                          } : p)
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Échéance</label>
                    <Input
                      placeholder="Note ou deadline (optionnel)"
                      className="text-sm h-8"
                      value={item.dueAt || ''}
                      onChange={(event) =>
                        updateState(prev => ({
                          ...prev,
                          phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                            ...p,
                            checklist: {
                              ...p.checklist,
                              operational: p.checklist.operational.map(oi => oi.id === item.id ? { ...oi, dueAt: event.target.value } : oi)
                            }
                          } : p)
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 bg-gray-50">
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() =>
                  updateState(prev => ({
                    ...prev,
                    phases: prev.phases.map((p, idx) => idx === phaseIndex ? {
                      ...p,
                      checklist: {
                        ...p.checklist,
                        operational: [
                          ...p.checklist.operational,
                          {
                            id: generateSessionId(),
                            text: "Nouvelle tâche opérationnelle",
                            checked: false,
                            assignee: "",
                            dueAt: ""
                          }
                        ]
                      }
                    } : p)
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une tâche opérationnelle
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}