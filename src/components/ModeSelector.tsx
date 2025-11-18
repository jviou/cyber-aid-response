import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, BookOpen } from "lucide-react";
import { Mode, Severity } from "@/types/crisis";

interface ModeSelectorProps {
  isOpen: boolean;
  onModeSelect: (mode: Mode, title: string, description: string, severity: Severity) => void;
}

export function ModeSelector({ isOpen, onModeSelect }: ModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("moderate");

  const handleSubmit = () => {
    if (selectedMode && title.trim()) {
      onModeSelect(selectedMode, title.trim(), description.trim(), severity);
    }
  };

  const getSeverityBadgeVariant = (sev: Severity) => {
    switch (sev) {
      case "low": return "secondary";
      case "moderate": return "default";
      case "high": return "destructive";
      case "critical": return "destructive";
      default: return "default";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-header bg-clip-text text-transparent">
            Sélection du Mode de Crise
          </DialogTitle>
        </DialogHeader>

        {!selectedMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <Card 
              className="cursor-pointer hover:shadow-card transition-all duration-200 hover:border-primary"
              onClick={() => setSelectedMode("exercise")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Mode Exercice</CardTitle>
                <CardDescription>Formation et simulation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Injects programmables</li>
                  <li>• Environnement de test</li>
                  <li>• Debriefs intégrés</li>
                  <li>• Aucun impact réel</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-card transition-all duration-200 hover:border-destructive"
              onClick={() => setSelectedMode("real")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-destructive rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Mode Réel</CardTitle>
                <CardDescription>Gestion d'incident opérationnelle</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Journal temps réel</li>
                  <li>• Communications urgentes</li>
                  <li>• Suivi d'actions critiques</li>
                  <li>• Export SITREP</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 p-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              {selectedMode === "exercise" ? (
                <>
                  <BookOpen className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Mode Exercice sélectionné</h3>
                    <p className="text-sm text-muted-foreground">Configuration de la simulation</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                  <div>
                    <h3 className="font-semibold">Mode Réel sélectionné</h3>
                    <p className="text-sm text-muted-foreground">Configuration de l'incident</p>
                  </div>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => setSelectedMode(null)}
              >
                Changer
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Titre {selectedMode === "exercise" ? "de l'exercice" : "de l'incident"}
                </label>
                <Input
                  placeholder={selectedMode === "exercise" ? "Ex: Exercice ransomware Q1 2025" : "Ex: Incident sécurité - Système XYZ"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder={selectedMode === "exercise" ? "Objectifs et contexte de l'exercice..." : "Description de l'incident détecté..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Gravité</label>
                <Select value={severity} onValueChange={(value) => setSeverity(value as Severity)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Faible</Badge>
                        <span className="text-sm">Impact limité</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderate">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Modérée</Badge>
                        <span className="text-sm">Impact contrôlé</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Élevée</Badge>
                        <span className="text-sm">Impact significatif</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="critical">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-critical text-critical-foreground">Critique</Badge>
                        <span className="text-sm">Impact majeur</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedMode(null)}>
                Retour
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="bg-gradient-primary hover:bg-primary-hover"
              >
                Démarrer la session
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}