import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Settings, Clock } from "lucide-react";
import { useLocalPhases } from "@/hooks/useLocalPhases";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PhaseManagementProps {
  sessionId: string;
}

export function PhaseManagement({ sessionId }: PhaseManagementProps) {
  const { phaseId } = useParams<{ phaseId: string }>();
  const { phases, loading, error, updateChecklistItem } = useLocalPhases(sessionId);
  
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


  const getPhaseNumber = (phaseId: string) => {
    switch(phaseId) {
      case 'P1': return 1;
      case 'P2': return 2;
      case 'P3': return 3;
      case 'P4': return 4;
      default: return 1;
    }
  };

  const getPhaseProgress = (phaseData: any) => {
    const totalItems = phaseData.checklist.strategic.length + phaseData.checklist.operational.length;
    const completedItems = phaseData.checklist.strategic.filter((item: any) => item.status === 'done').length + 
                          phaseData.checklist.operational.filter((item: any) => item.status === 'done').length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getStrategicProgress = (phaseData: any) => {
    const totalItems = phaseData.checklist.strategic.length;
    const completedItems = phaseData.checklist.strategic.filter((item: any) => item.status === 'done').length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getOperationalProgress = (phaseData: any) => {
    const totalItems = phaseData.checklist.operational.length;
    const completedItems = phaseData.checklist.operational.filter((item: any) => item.status === 'done').length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  return (
    <div className="bg-blue-600 min-h-screen">
      {/* Phase Header */}
      <div className="text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">PHASE {getPhaseNumber(phase.id)}</h1>
            <p className="text-blue-200">{phase.title}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{Math.round(getPhaseProgress(phase))}%</div>
            <div className="text-sm text-blue-200">
              {phase.checklist.strategic.filter((item: any) => item.status === 'done').length + 
               phase.checklist.operational.filter((item: any) => item.status === 'done').length} / {phase.checklist.strategic.length + phase.checklist.operational.length} tâches
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
              {phase.checklist.strategic.filter((item: any) => item.status === 'done').length} / {phase.checklist.strategic.length} terminées
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {phase.checklist.strategic.map((item: any) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox
                    id={`strategic-${item.id}`}
                    checked={item.status === 'done'}
                    onCheckedChange={(checked) => 
                      updateChecklistItem(phase.id, 'strategic', item.id, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`strategic-${item.id}`}
                      className="block font-medium text-gray-900 cursor-pointer"
                    >
                      {item.text}
                    </label>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">À faire</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Responsable</label>
                    <Input 
                      placeholder="Assigner à..." 
                      className="text-sm h-8"
                      defaultValue="jj/mm/aaaa --:--"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Échéance</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="jj/mm/aaaa --:--"
                        className="text-sm h-8"
                        defaultValue="jj/mm/aaaa --:--"
                      />
                      <Button size="sm" variant="outline" className="h-8 px-2">
                        📅
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              {phase.checklist.operational.filter((item: any) => item.status === 'done').length} / {phase.checklist.operational.length} terminées
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {phase.checklist.operational.map((item: any) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox
                    id={`operational-${item.id}`}
                    checked={item.status === 'done'}
                    onCheckedChange={(checked) => 
                      updateChecklistItem(phase.id, 'operational', item.id, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`operational-${item.id}`}
                      className="block font-medium text-gray-900 cursor-pointer"
                    >
                      {item.text}
                    </label>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">À faire</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Responsable</label>
                    <Input 
                      placeholder="Assigner à..." 
                      className="text-sm h-8"
                      defaultValue="jj/mm/aaaa --:--"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Échéance</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="jj/mm/aaaa --:--"
                        className="text-sm h-8"
                        defaultValue="jj/mm/aaaa --:--"
                      />
                      <Button size="sm" variant="outline" className="h-8 px-2">
                        📅
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}