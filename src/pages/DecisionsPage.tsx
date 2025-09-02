import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Clock, User } from "lucide-react";
import { Decision } from "@/types/crisis";
import { toast } from "sonner";

interface DecisionsPageProps {
  decisions: Decision[];
  onCreateDecision: (decisionData: Omit<Decision, 'id' | 'decidedAt'>) => void;
  onDeleteDecision: (id: string) => void;
}

export function DecisionsPage({ decisions, onCreateDecision, onDeleteDecision }: DecisionsPageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDecision, setNewDecision] = useState({
    question: "",
    optionChosen: "",
    rationale: "",
    validator: "",
    impacts: [] as string[]
  });

  const handleAddDecision = () => {
    if (!newDecision.question || !newDecision.optionChosen) {
      toast.error("Question et option choisie sont requises");
      return;
    }

    onCreateDecision({
      question: newDecision.question,
      optionChosen: newDecision.optionChosen,
      rationale: newDecision.rationale,
      validator: newDecision.validator,
      impacts: newDecision.impacts.filter(impact => impact.trim() !== "")
    });

    setNewDecision({
      question: "",
      optionChosen: "",
      rationale: "",
      validator: "",
      impacts: []
    });
    setIsAddOpen(false);
    
    toast.success("Décision enregistrée");
  };

  const handleDeleteDecision = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette décision ?")) {
      onDeleteDecision(id);
      toast.success("Décision supprimée");
    }
  };

  const handleAddImpact = () => {
    setNewDecision({
      ...newDecision,
      impacts: [...newDecision.impacts, ""]
    });
  };

  const handleUpdateImpact = (index: number, value: string) => {
    const updatedImpacts = [...newDecision.impacts];
    updatedImpacts[index] = value;
    setNewDecision({
      ...newDecision,
      impacts: updatedImpacts
    });
  };

  const handleRemoveImpact = (index: number) => {
    setNewDecision({
      ...newDecision,
      impacts: newDecision.impacts.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Décisions</h1>
          <p className="text-muted-foreground mt-2">
            Suivi des décisions prises durant la crise
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Décision
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle Décision</DialogTitle>
              <DialogDescription>
                Enregistrer une décision prise durant la gestion de crise
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Question/Problème</Label>
                <Textarea
                  value={newDecision.question}
                  onChange={(e) => setNewDecision({...newDecision, question: e.target.value})}
                  placeholder="Quelle est la question ou le problème à résoudre ?"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Option choisie</Label>
                <Textarea
                  value={newDecision.optionChosen}
                  onChange={(e) => setNewDecision({...newDecision, optionChosen: e.target.value})}
                  placeholder="Quelle décision a été prise ?"
                  rows={2}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Justification</Label>
                <Textarea
                  value={newDecision.rationale}
                  onChange={(e) => setNewDecision({...newDecision, rationale: e.target.value})}
                  placeholder="Pourquoi cette décision a-t-elle été prise ?"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Validé par</Label>
                <Input 
                  value={newDecision.validator}
                  onChange={(e) => setNewDecision({...newDecision, validator: e.target.value})}
                  placeholder="Qui a validé cette décision ?"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Impacts identifiés</Label>
                {newDecision.impacts.map((impact, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={impact}
                      onChange={(e) => handleUpdateImpact(index, e.target.value)}
                      placeholder={`Impact ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveImpact(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddImpact}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un impact
                </Button>
              </div>
              
              <Button onClick={handleAddDecision} className="w-full">
                Enregistrer la Décision
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {decisions.filter(d => 
                new Date(d.decidedAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avec impacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {decisions.filter(d => d.impacts && d.impacts.length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decisions List */}
      <div className="space-y-4">
        {decisions.length > 0 ? (
          decisions
            .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())
            .map((decision) => (
              <Card key={decision.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{decision.question}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(decision.decidedAt).toLocaleString('fr-FR')}
                        {decision.validator && (
                          <>
                            <span>•</span>
                            <User className="w-3 h-3" />
                            <span>Validé par {decision.validator}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDecision(decision.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-green-800 bg-green-50 px-2 py-1 rounded mb-2">
                        ✓ Décision prise
                      </h4>
                      <p>{decision.optionChosen}</p>
                    </div>
                    
                    {decision.rationale && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Justification</h4>
                        <p className="text-muted-foreground">{decision.rationale}</p>
                      </div>
                    )}
                    
                    {decision.impacts && decision.impacts.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Impacts identifiés</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          {decision.impacts.map((impact, index) => (
                            <li key={index}>{impact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Aucune décision enregistrée pour l'instant
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}