import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import { usePhases } from "@/hooks/usePhases";

interface PhaseManagementProps {
  sessionId: string;
}

export function PhaseManagement({ sessionId }: PhaseManagementProps) {
  const { phaseId } = useParams<{ phaseId: string }>();
  const { phases, loading, error } = usePhases(sessionId);
  
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


  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-phase-${phase.order_index} text-white`}>
              {phase.order_index}
            </div>
            {phase.title}
          </h1>
          {phase.subtitle && (
            <p className="text-xl text-muted-foreground mt-1">{phase.subtitle}</p>
          )}
        </div>
      </div>

      {/* Phase Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Code:</strong> {phase.code}</p>
            <p><strong>Ordre:</strong> Phase {phase.order_index}</p>
            <p><strong>Créée le:</strong> {new Date(phase.created_at).toLocaleString('fr-FR')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}