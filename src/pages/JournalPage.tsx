import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Clock, Plus, Filter, Download, Search } from "lucide-react";
import { CrisisSession, JournalEvent } from "@/types/crisis";
import Fuse from 'fuse.js';
import { useToast } from "@/hooks/use-toast";

interface JournalPageProps {
  session: CrisisSession;
  onUpdateSession: (updater: (session: CrisisSession) => CrisisSession) => void;
}

const categories = [
  "detection", "containment", "eradication", "recovery", 
  "communication", "decision", "legal", "incident", "action", "note"
];

const categoryColors: Record<string, string> = {
  detection: "bg-red-100 text-red-800",
  containment: "bg-orange-100 text-orange-800", 
  eradication: "bg-yellow-100 text-yellow-800",
  recovery: "bg-green-100 text-green-800",
  communication: "bg-blue-100 text-blue-800",
  decision: "bg-purple-100 text-purple-800",
  legal: "bg-gray-100 text-gray-800",
  incident: "bg-red-100 text-red-800",
  action: "bg-indigo-100 text-indigo-800",
  note: "bg-slate-100 text-slate-800"
};

export function JournalPage({ session, onUpdateSession }: JournalPageProps) {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newEvent, setNewEvent] = useState({
    category: "",
    title: "",
    details: "",
    by: ""
  });

  // Fuse.js setup for search
  const fuse = useMemo(() => {
    return new Fuse(session.journal, {
      keys: ['title', 'details', 'by', 'category'],
      threshold: 0.3
    });
  }, [session.journal]);

  // Filter and search events
  const filteredEvents = useMemo(() => {
    let events = session.journal;
    
    // Apply search
    if (searchQuery.trim()) {
      const results = fuse.search(searchQuery);
      events = results.map(result => result.item);
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      events = events.filter(event => event.category === selectedCategory);
    }
    
    // Sort by date (most recent first)
    return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [session.journal, selectedCategory, searchQuery, fuse]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = session.journal.length;
    const incidents = session.journal.filter(e => e.category === "incident" || e.category === "detection").length;
    const actions = session.journal.filter(e => e.category === "action").length;
    const decisions = session.journal.filter(e => e.category === "decision").length;
    
    return { total, incidents, actions, decisions };
  }, [session.journal]);

  const handleAddEvent = () => {
    if (!newEvent.category || !newEvent.title) {
      toast({
        title: "Erreur",
        description: "Catégorie et titre sont requis",
        variant: "destructive"
      });
      return;
    }

    const event: JournalEvent = {
      id: `journal-${Date.now()}`,
      category: newEvent.category,
      title: newEvent.title,
      details: newEvent.details,
      by: newEvent.by || "Utilisateur",
      at: new Date().toISOString()
    };

    onUpdateSession(session => ({
      ...session,
      journal: [...session.journal, event]
    }));

    setNewEvent({ category: "", title: "", details: "", by: "" });
    setIsAddOpen(false);
    
    toast({
      title: "Événement ajouté",
      description: "L'événement a été enregistré dans le journal"
    });
  };

  const exportCSV = () => {
    const headers = ["Date", "Heure", "Catégorie", "Titre", "Détails", "Auteur"];
    const csvData = filteredEvents.map(event => [
      new Date(event.at).toLocaleDateString('fr-FR'),
      new Date(event.at).toLocaleTimeString('fr-FR'), 
      event.category,
      event.title,
      event.details || "",
      event.by || ""
    ]);
    
    const csv = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-${session.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export terminé",
      description: "Le journal a été exporté en CSV"
    });
  };

  const exportJSON = () => {
    const data = { 
      session: session.title,
      exported: new Date().toISOString(),
      events: filteredEvents 
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export terminé", 
      description: "Le journal a été exporté en JSON"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Journal des Événements</h1>
          <p className="text-muted-foreground mt-2">
            Suivi chronologique de tous les événements de la crise
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportJSON}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.incidents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.actions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Décisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.decisions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Add */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Rechercher dans le journal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Toutes catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un Événement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau Événement</DialogTitle>
              <DialogDescription>
                Enregistrer un nouvel événement dans le journal de crise
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Catégorie</Label>
                <Select value={newEvent.category} onValueChange={(value) => setNewEvent({...newEvent, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Titre</Label>
                <Input 
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Titre de l'événement"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Détails</Label>
                <Textarea
                  value={newEvent.details}
                  onChange={(e) => setNewEvent({...newEvent, details: e.target.value})}
                  placeholder="Description détaillée (optionnel)"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Auteur</Label>
                <Input 
                  value={newEvent.by}
                  onChange={(e) => setNewEvent({...newEvent, by: e.target.value})}
                  placeholder="Qui a effectué cette action"
                />
              </div>
              
              <Button onClick={handleAddEvent} className="w-full">
                Enregistrer l'Événement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className={categoryColors[event.category] || "bg-gray-100 text-gray-800"}>
                      {event.category}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{event.title}</h3>
                    {event.details && (
                      <p className="text-muted-foreground mt-1">{event.details}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(event.at).toLocaleString('fr-FR')}
                      {event.by && <span>• par {event.by}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all" 
                  ? "Aucun événement ne correspond aux critères de recherche"
                  : "Aucun événement enregistré"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}