
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PhaseCard } from "@/components/PhaseCard";
import { Target, TrendingUp } from "lucide-react";

interface PhasesPageProps {
  sessionId: string;
  phases: Array<{
    id: string;
    code: string;
    title: string;
    subtitle?: string;
    order_index: number;
  }>;
}

export function PhasesPage({ sessionId, phases }: PhasesPageProps) {
  const navigate = useNavigate();

  // Calculate overall progress (mock for now)
  const overallProgress = 25;

  const handlePhaseSelect = (phaseId: string, phaseIndex: number) => {
    navigate(`/s/${sessionId}/phases/${phaseIndex}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phases de Gestion</h1>
          <p className="text-muted-foreground mt-2">
            Suivi de l'avancement des phases de gestion de crise
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">
            {overallProgress}%
          </div>
          <p className="text-sm text-muted-foreground">
            Progression globale
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Vue d'ensemble
          </CardTitle>
          <CardDescription>
            Progression générale des phases de gestion de crise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-4 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground">Phases totales</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-sm text-muted-foreground">Terminées</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">2</div>
              <div className="text-sm text-muted-foreground">En cours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">1</div>
              <div className="text-sm text-muted-foreground">À venir</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {phases
          .sort((a, b) => a.order_index - b.order_index)
          .map((phase) => {
            // Mock progress for each phase
            const phaseProgress = phase.order_index === 1 ? 100 : 
                                phase.order_index === 2 ? 60 : 
                                phase.order_index === 3 ? 30 : 0;
            
            return (
              <PhaseCard
                key={phase.id}
                phase={phase}
                progress={phaseProgress}
                onSelect={() => handlePhaseSelect(phase.id, phase.order_index)}
              />
            );
          })}
      </div>

      {phases.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune phase configurée</h3>
            <p className="text-muted-foreground">
              Les phases de gestion seront créées automatiquement lors de l'initialisation de la session.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
