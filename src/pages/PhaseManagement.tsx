import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  Target,
  Settings
} from "lucide-react";
import { CrisisSession, ChecklistItem, TaskStatus } from "@/types/crisis";
import { useState } from "react";

interface PhaseManagementProps {
  session: CrisisSession;
  onUpdateSession: (updater: (session: CrisisSession) => CrisisSession) => void;
}

export function PhaseManagement({ session, onUpdateSession }: PhaseManagementProps) {
  const { phaseId } = useParams<{ phaseId: string }>();
  const phaseIndex = phaseId ? parseInt(phaseId) - 1 : 0;
  const phase = session.phases[phaseIndex];

  const [notes, setNotes] = useState(phase?.notes || "");

  if (!phase) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Phase non trouvée</h2>
        <p className="text-muted-foreground">La phase demandée n'existe pas.</p>
      </div>
    );
  }

  const updateChecklistItem = (
    type: 'strategic' | 'operational',
    itemId: string,
    updates: Partial<ChecklistItem>
  ) => {
    onUpdateSession((session) => {
      const updatedSession = { ...session };
      const phaseToUpdate = updatedSession.phases[phaseIndex];
      
      phaseToUpdate.checklist[type] = phaseToUpdate.checklist[type].map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );

      return updatedSession;
    });
  };

  const updateNotes = () => {
    onUpdateSession((session) => {
      const updatedSession = { ...session };
      updatedSession.phases[phaseIndex].notes = notes;
      return updatedSession;
    });
  };

  const getStatusBadge = (status: TaskStatus) => {
    const variants = {
      todo: { variant: "outline" as const, icon: Clock, label: "À faire" },
      doing: { variant: "default" as const, icon: Target, label: "En cours" },
      done: { variant: "secondary" as const, icon: CheckCircle, label: "Terminé", className: "bg-success text-success-foreground" },
      "n/a": { variant: "secondary" as const, icon: AlertTriangle, label: "N/A" }
    };
    return variants[status];
  };

  const calculateProgress = (checklist: ChecklistItem[]) => {
    if (checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.status === "done").length;
    return (completed / checklist.length) * 100;
  };

  const strategicProgress = calculateProgress(phase.checklist.strategic);
  const operationalProgress = calculateProgress(phase.checklist.operational);
  const totalItems = phase.checklist.strategic.length + phase.checklist.operational.length;
  const completedItems = phase.checklist.strategic.filter(item => item.status === "done").length + 
                        phase.checklist.operational.filter(item => item.status === "done").length;
  const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const renderChecklist = (items: ChecklistItem[], type: 'strategic' | 'operational', title: string) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {title}
            </CardTitle>
            <CardDescription>
              {items.filter(item => item.status === "done").length} / {items.length} terminées
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {type === 'strategic' ? strategicProgress.toFixed(0) : operationalProgress.toFixed(0)}%
            </div>
            <Progress 
              value={type === 'strategic' ? strategicProgress : operationalProgress} 
              className="w-24 mt-1" 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const statusConfig = getStatusBadge(item.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                checked={item.status === "done"}
                onCheckedChange={(checked) => 
                  updateChecklistItem(type, item.id, { 
                    status: checked ? "done" : "todo" 
                  })
                }
                className="mt-1"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-medium ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {item.text}
                  </p>
                  <Badge 
                    variant={statusConfig.variant}
                    className={`flex items-center gap-1 ${'className' in statusConfig ? statusConfig.className : ""}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Responsable</label>
                    <Input
                      value={item.owner || ""}
                      onChange={(e) => updateChecklistItem(type, item.id, { owner: e.target.value })}
                      placeholder="Assigner à..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Échéance</label>
                    <Input
                      type="datetime-local"
                      value={item.dueAt || ""}
                      onChange={(e) => updateChecklistItem(type, item.id, { dueAt: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {item.owner && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    {item.owner}
                    {item.dueAt && (
                      <>
                        <Calendar className="w-3 h-3 ml-2" />
                        {new Date(item.dueAt).toLocaleString('fr-FR')}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Aucune tâche dans cette catégorie
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Phase Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full bg-phase-${phaseIndex + 1}`} />
            {phase.title}
          </h1>
          {phase.subtitle && (
            <p className="text-xl text-muted-foreground mt-1">{phase.subtitle}</p>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">
            {overallProgress.toFixed(0)}%
          </div>
          <p className="text-sm text-muted-foreground">
            {completedItems} / {totalItems} tâches
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progression de la phase</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Stratégique: {strategicProgress.toFixed(0)}%</span>
            <span>Opérationnel: {operationalProgress.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Checklists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {renderChecklist(phase.checklist.strategic, 'strategic', 'Gestion Stratégique')}
        {renderChecklist(phase.checklist.operational, 'operational', 'Gestion Opérationnelle')}
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes et constats</CardTitle>
          <CardDescription>
            Observations et commentaires pour cette phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez vos notes, observations et constats pour cette phase..."
            rows={4}
          />
          <Button 
            onClick={updateNotes}
            className="mt-2"
            variant="outline"
          >
            Sauvegarder les notes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}