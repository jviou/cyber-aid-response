import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ContactsCard } from "@/components/ContactsCard";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  MessageSquare,
  Download,
  BookOpen,
  Target
} from "lucide-react";
import { CrisisSession } from "@/types/crisis";
import { exerciseDefaults } from "@/data/crisisData";

interface DashboardProps {
  session: CrisisSession;
  onExport: () => void;
  onUpdateSession: (updater: (session: CrisisSession) => CrisisSession) => void;
}

export function Dashboard({ session, onExport, onUpdateSession }: DashboardProps) {
  const isExercise = session.mode === "exercise";

  // Calculate KPIs
  const totalChecklist = session.phases.reduce((acc, phase) => 
    acc + phase.checklist.strategic.length + phase.checklist.operational.length, 0
  );
  
  const completedChecklist = session.phases.reduce((acc, phase) => 
    acc + 
    phase.checklist.strategic.filter(item => item.status === "done").length +
    phase.checklist.operational.filter(item => item.status === "done").length, 
    0
  );

  const completionPercentage = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;

  const openActions = session.actions.filter(action => action.status !== "done").length;
  const recentEvents = session.journal.slice(-3).reverse();

  if (isExercise) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Exercice de Crise Cyber</h1>
            <p className="text-muted-foreground mt-2">{session.description}</p>
          </div>
          <Button onClick={onExport} className="bg-gradient-primary">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>

        {/* Exercise Objectives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Objectifs de l'exercice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(session.objectives || exerciseDefaults.objectives).map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Règles de l'exercice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(session.rules || exerciseDefaults.rules).map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Key Contacts */}
        <ContactsCard 
          contacts={session.keyContacts || []}
          onUpdateContacts={(contacts) => onUpdateSession(session => ({ ...session, keyContacts: contacts }))}
        />
      </div>
    );
  }

  // Real mode dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion de Crise - Mode Réel</h1>
          <p className="text-muted-foreground mt-2">{session.description}</p>
        </div>
        <Button onClick={onExport} variant="destructive">
          <Download className="w-4 h-4 mr-2" />
          Exporter SITREP
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage.toFixed(0)}%</div>
            <Progress value={completionPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedChecklist} / {totalChecklist} tâches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions ouvertes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{openActions}</div>
            <p className="text-xs text-muted-foreground">
              en cours de traitement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Décisions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{session.decisions.length}</div>
            <p className="text-xs text-muted-foreground">
              prises depuis le début
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{session.communications.length}</div>
            <p className="text-xs text-muted-foreground">
              envoyées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Contacts */}
      <ContactsCard 
        contacts={session.keyContacts || []}
        onUpdateContacts={(contacts) => onUpdateSession(session => ({ ...session, keyContacts: contacts }))}
      />

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Derniers événements</CardTitle>
          <CardDescription>
            Aperçu des 3 dernières entrées du journal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{event.title}</p>
                    {event.details && (
                      <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(event.at).toLocaleString('fr-FR')}
                      {event.by && <span>• par {event.by}</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Aucun événement enregistré
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}