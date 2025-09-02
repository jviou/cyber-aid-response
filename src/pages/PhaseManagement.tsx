import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { usePhases } from "@/hooks/usePhases";
import { Checkbox } from "@/components/ui/checkbox";

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

  return (
    <div className="space-y-6">
      {/* Phase Header with Blue Background */}
      <div className="bg-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">PHASE {phase.order_index}</h1>
        
        {/* Phase Flow Diagram */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold">GESTION MÉTIER</h2>
          </div>
          
          {/* Phase Flow */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold">
              INCIDENT
            </div>
            <ArrowRight className="text-white" size={20} />
            
            {allPhases.map((p, index) => (
              <div key={p.id} className="flex items-center">
                <div className={`px-6 py-3 text-sm font-bold transform skew-x-[-20deg] ${
                  p.isActive ? 'bg-blue-800 text-white' : 
                  p.isCompleted ? 'bg-blue-400 text-white' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  <span className="transform skew-x-[20deg] block">PHASE {p.order_index}</span>
                </div>
                {index < allPhases.length - 1 && <ArrowRight className="text-white mx-1" size={16} />}
              </div>
            ))}
          </div>

          {/* Phase Descriptions */}
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-gray-200">Mobiliser</div>
              <div className="font-semibold">Alerter et</div>
              <div className="font-semibold">endiguer</div>
            </div>
            <div className="text-center">
              <div className="text-gray-200">Maintenir</div>
              <div className="text-gray-200">la confiance</div>
              <div className="font-semibold">Comprendre</div>
              <div className="font-semibold">l'attaque</div>
            </div>
            <div className="text-center">
              <div className="text-gray-200">Relancer</div>
              <div className="text-gray-200">les activités</div>
              <div className="font-semibold">Durcir</div>
              <div className="font-semibold">et surveiller</div>
            </div>
            <div className="text-center">
              <div className="text-gray-200">Tirer les leçons</div>
              <div className="text-gray-200">de la crise</div>
              <div className="font-semibold">Capitaliser</div>
            </div>
          </div>

          <div className="text-center mt-4">
            <div className="text-lg font-semibold">GESTION CYBER</div>
          </div>
        </div>
      </div>

      {/* Checklist Section */}
      <div className="bg-blue-600 text-white rounded-lg overflow-hidden">
        <div className="bg-blue-700 p-4">
          <h2 className="text-2xl font-bold text-center">GESTION STRATÉGIQUE ET OPÉRATIONNELLE</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Strategic Management */}
          <div className="bg-gray-200 text-gray-800">
            <div className="bg-blue-600 text-white p-4">
              <h3 className="text-xl font-bold text-center">GESTION STRATÉGIQUE</h3>
            </div>
            <div className="p-6 space-y-4">
              {phase.strategic_checklist.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-lg">-</span>
                  <span className="flex-1 text-lg">{item.text}</span>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`strategic-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={(checked) => 
                        updateChecklistItem(phase.id, 'strategic', item.id, checked as boolean)
                      }
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <label 
                      htmlFor={`strategic-${item.id}`}
                      className="bg-white border border-gray-400 px-3 py-1 text-sm font-bold cursor-pointer"
                    >
                      OK
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Management */}
          <div className="bg-gray-200 text-gray-800">
            <div className="bg-blue-600 text-white p-4">
              <h3 className="text-xl font-bold text-center">GESTION OPÉRATIONNELLE</h3>
            </div>
            <div className="p-6 space-y-4">
              {phase.operational_checklist.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-lg">-</span>
                  <span className="flex-1 text-lg">{item.text}</span>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`operational-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={(checked) => 
                        updateChecklistItem(phase.id, 'operational', item.id, checked as boolean)
                      }
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <label 
                      htmlFor={`operational-${item.id}`}
                      className="bg-white border border-gray-400 px-3 py-1 text-sm font-bold cursor-pointer"
                    >
                      OK
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Progression de la phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getPhaseProgress(phase)} className="h-3" />
            <div className="text-sm text-muted-foreground">
              {Math.round(getPhaseProgress(phase))}% complété
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}