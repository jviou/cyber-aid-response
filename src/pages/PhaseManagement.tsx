import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Settings, Clock } from "lucide-react";
import { usePhases } from "@/hooks/usePhases";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PhaseManagementProps {
  sessionId: string;
}

export function PhaseManagement({ sessionId }: PhaseManagementProps) {
  const { phaseId } = useParams<{ phaseId: string }>();
  const { phases, loading, error, updateChecklistItem } = usePhases(sessionId);
  
  const phaseIndex = phaseId ? parseInt(phaseId) - 1 : 0;
  const phase = phases[phaseIndex];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Chargement de la phase...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erreur</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!phase) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Phase non trouvée</h2>
        <p className="text-muted-foreground">La phase demandée n'existe pas.</p>
      </div>
    );
  }


  const allPhases = phases.map((p, index) => ({
    ...p,
    isActive: p.order_index === phase.order_index,
    isCompleted: p.order_index < phase.order_index
  }));

  const getPhaseProgress = (phaseData: any) => {
    const totalItems = phaseData.strategic_checklist.length + phaseData.operational_checklist.length;
    const completedItems = phaseData.strategic_checklist.filter((item: any) => item.completed).length + 
                          phaseData.operational_checklist.filter((item: any) => item.completed).length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getStrategicProgress = (phaseData: any) => {
    const totalItems = phaseData.strategic_checklist.length;
    const completedItems = phaseData.strategic_checklist.filter((item: any) => item.completed).length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getOperationalProgress = (phaseData: any) => {
    const totalItems = phaseData.operational_checklist.length;
    const completedItems = phaseData.operational_checklist.filter((item: any) => item.completed).length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Phase Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">PHASE {phase.order_index}</h1>
          <p className="text-lg text-gray-600">{phase.title}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-blue-600">{Math.round(getPhaseProgress(phase))}%</div>
          <div className="text-sm text-gray-500">
            {phase.strategic_checklist.filter((item: any) => item.completed).length + 
             phase.operational_checklist.filter((item: any) => item.completed).length} / {phase.strategic_checklist.length + phase.operational_checklist.length} tâches
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Progression de la phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Stratégique: {Math.round(getStrategicProgress(phase))}%</span>
              <span>Opérationnel: {Math.round(getOperationalProgress(phase))}%</span>
            </div>
            <Progress value={getPhaseProgress(phase)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Management Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strategic Management */}
        <Card>
          <CardHeader className="bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <CardTitle>Gestion Stratégique</CardTitle>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(getStrategicProgress(phase))}%
              </div>
            </div>
            <CardDescription>
              {phase.strategic_checklist.filter((item: any) => item.completed).length} / {phase.strategic_checklist.length} terminées
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {phase.strategic_checklist.map((item: any, index: number) => (
                <div key={item.id} className={`p-4 border-b last:border-b-0 ${item.completed ? 'bg-green-50' : ''}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox
                      id={`strategic-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={(checked) => 
                        updateChecklistItem(phase.id, 'strategic', item.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`strategic-${item.id}`}
                        className={`block text-sm font-medium cursor-pointer ${item.completed ? 'line-through text-gray-500' : ''}`}
                      >
                        {item.text}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">À faire</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Responsable</label>
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="Assigner à..." 
                          className="text-xs h-8"
                        />
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          Assigner
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Échéance</label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="date"
                          className="text-xs h-8"
                        />
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          📅
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operational Management */}
        <Card>
          <CardHeader className="bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <CardTitle>Gestion Opérationnelle</CardTitle>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(getOperationalProgress(phase))}%
              </div>
            </div>
            <CardDescription>
              {phase.operational_checklist.filter((item: any) => item.completed).length} / {phase.operational_checklist.length} terminées
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {phase.operational_checklist.map((item: any, index: number) => (
                <div key={item.id} className={`p-4 border-b last:border-b-0 ${item.completed ? 'bg-green-50' : ''}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox
                      id={`operational-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={(checked) => 
                        updateChecklistItem(phase.id, 'operational', item.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`operational-${item.id}`}
                        className={`block text-sm font-medium cursor-pointer ${item.completed ? 'line-through text-gray-500' : ''}`}
                      >
                        {item.text}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">À faire</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Responsable</label>
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="Assigner à..." 
                          className="text-xs h-8"
                        />
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          Assigner
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Échéance</label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="date"
                          className="text-xs h-8"
                        />
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          📅
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}