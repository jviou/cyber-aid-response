import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  MessageSquare,
  Target,
  Plus,
  Trash2,
  FileText,
  Gavel
} from "lucide-react";
import { useCrisisState } from "@/hooks/useCrisisState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Dashboard() {
  const { state, updateState, sessionId } = useCrisisState();
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    role: "",
    email: "",
    phone: ""
  });

  // Real-time updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'crisis_sessions'
      }, () => {
        // Refresh crisis state when data changes
        window.location.reload(); // Simple refresh for now
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Calculate KPIs
  const totalRidaItems = state.decisions.length; // RIDA items are stored in decisions
  const totalCommunications = state.communications.length;
  
  const phasesProgress = useMemo(() => {
    if (!state.phases || state.phases.length === 0) return 0;
    
    const totalItems = state.phases.reduce((acc, phase) => {
      const strategicItems = phase.strategic?.length || 0;
      const operationalItems = phase.operational?.length || 0;
      return acc + strategicItems + operationalItems;
    }, 0);
    
    const completedItems = state.phases.reduce((acc, phase) => {
      const strategicCompleted = phase.strategic?.filter(item => item.checked).length || 0;
      const operationalCompleted = phase.operational?.filter(item => item.checked).length || 0;
      return acc + strategicCompleted + operationalCompleted;
    }, 0);
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [state.phases]);
  
  // Recent journal events
  const recentEvents = state.journal.slice(0, 3);
  
  // Recent RIDA items
  const recentRida = state.decisions.slice(-3).reverse();
  
  const handleAddContact = () => {
    if (!newContact.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    
    const contact = {
      id: crypto.randomUUID(),
      ...newContact
    };
    
    updateState(prev => ({
      ...prev,
      contacts: [...prev.contacts, contact]
    }));
    
    setNewContact({ name: "", role: "", email: "", phone: "" });
    setIsAddContactOpen(false);
    toast.success("Contact ajouté");
  };
  
  const handleDeleteContact = (id: string) => {
    if (confirm("Supprimer ce contact ?")) {
      updateState(prev => ({
        ...prev,
        contacts: prev.contacts.filter(c => c.id !== id)
      }));
      toast.success("Contact supprimé");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord</h1>
          <p className="text-muted-foreground mt-2">Vue d'ensemble de la session</p>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Éléments RIDA</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRidaItems}</div>
            <p className="text-xs text-muted-foreground">Informations, Décisions & Actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommunications}</div>
            <p className="text-xs text-muted-foreground">Envoyées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression Phases</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(phasesProgress)}%</div>
            <Progress value={phasesProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contacts clés */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contacts Clés</CardTitle>
              <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouveau Contact</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Nom *</Label>
                      <Input
                        value={newContact.name}
                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                        placeholder="Nom complet"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Rôle</Label>
                      <Input
                        value={newContact.role}
                        onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                        placeholder="Fonction/Rôle"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                        placeholder="email@exemple.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Téléphone</Label>
                      <Input
                        value={newContact.phone}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                    <Button onClick={handleAddContact} className="w-full">
                      Ajouter le Contact
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {state.contacts.length > 0 ? (
              <div className="space-y-3">
                {state.contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      {contact.role && <p className="text-sm text-muted-foreground">{contact.role}</p>}
                      {contact.email && <p className="text-sm text-muted-foreground">{contact.email}</p>}
                      {contact.phone && <p className="text-sm text-muted-foreground">{contact.phone}</p>}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun contact ajouté</p>
            )}
          </CardContent>
        </Card>

        {/* Derniers événements */}
        <Card>
          <CardHeader>
            <CardTitle>Derniers Événements</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="border-l-4 border-primary pl-4 pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{event.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <h4 className="font-medium mt-1">{event.title}</h4>
                    {event.details && (
                      <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun événement enregistré</p>
            )}
          </CardContent>
        </Card>

        {/* Résumé RIDA */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-primary" />
              <CardTitle>Résumé RIDA</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recentRida.length > 0 ? (
              <div className="space-y-3">
                {recentRida.map((rida) => (
                  <div key={rida.id} className="border-l-4 border-amber-500 pl-4 pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        <FileText className="w-3 h-3 mr-1" />
                        RIDA
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(rida.decidedAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <h4 className="font-medium mt-1">{rida.title}</h4>
                    {rida.rationale && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {rida.rationale}
                      </p>
                    )}
                    {rida.owner && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs text-muted-foreground">Assigné à:</span>
                        <span className="text-xs font-medium">{rida.owner}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Gavel className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Aucun élément RIDA enregistré</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}