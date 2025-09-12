import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock, User, Info, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Decision } from "@/types/crisis";
import { toast } from "sonner";
import { saveRida, supabase, DEFAULT_SESSION_ID, listRida, deleteRida, Rida } from "@/lib/db";
import type { Database } from "@/integrations/supabase/types";

interface RIDAItem {
  id: string;
  date: string;
  time: string;
  subject: string;
  type: 'I' | 'D' | 'A';
  description: string;
  owner: string;
  status: 'À initier' | 'En cours' | 'En pause' | 'En retard' | 'Bloqué' | 'Terminé';
  dueDate?: string;
}

interface DecisionsPageProps {
  decisions: Decision[];
  onCreateDecision: (decisionData: Omit<Decision, 'id' | 'decidedAt'>) => void;
  onDeleteDecision: (id: string) => void;
}



export function DecisionsPage({ decisions, onCreateDecision, onDeleteDecision }: DecisionsPageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RIDAItem | null>(null);
  const [ridaItems, setRidaItems] = useState<Rida[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnsaved, setIsUnsaved] = useState(false);
  
  const [newRidaItem, setNewRidaItem] = useState({
    title: "",
    type: "I" as "I" | "D" | "A",
    notes: "",
    owner: "",
    status: "À initier" as string,
    dueDate: ""
  });

  // Load RIDA items from database
  const loadRidaItems = async () => {
    try {
      setLoading(true);
      const data = await listRida();
      setRidaItems(data);
    } catch (error) {
      console.error('Error loading RIDA items:', error);
      toast.error("Erreur lors du chargement des éléments RIDA");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRidaItems();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('rida-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rida_entry',
        filter: `session_id=eq.${DEFAULT_SESSION_ID}`
      }, () => {
        loadRidaItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSave = async () => {
    if (!newRidaItem.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    setIsSaving(true);
    try {
      await saveRida(newRidaItem);
      toast.success("Élément RIDA ajouté avec succès");
      
      setNewRidaItem({
        title: "",
        type: "I",
        notes: "",
        owner: "",
        status: "À initier",
        dueDate: ""
      });
      setIsAddOpen(false);
      setIsUnsaved(false);
      await loadRidaItems();
    } catch (error) {
      console.error('Error saving RIDA item:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRidaItem = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      try {
        await deleteRida(id);
        toast.success("Élément supprimé");
        await loadRidaItems();
      } catch (error) {
        console.error('Error deleting RIDA item:', error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const updateItemStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('rida_entry')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      await loadRidaItems();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nouveau': return 'bg-gray-100';
      case 'en_cours': return 'bg-yellow-100';
      case 'clos': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-200 to-purple-200 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Relevé des Informations, Décisions & Actions (RIDA)
            </h1>
            <p className="text-gray-600 mt-2 max-w-4xl">
              Le RIDA est un outil de gestion de projet qui permet de retrouver les différentes informations transmises lors d'une crise dans un document. Ces informations sont le point de départ de décisions à prendre en équipe, et d'actions à réaliser.
            </p>
            <div className="mt-4 text-sm text-gray-700">
              <p className="font-medium">Le relevé comprend :</p>
              <div className="flex flex-wrap gap-6 mt-2">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-800">• Information :</span>
                  <span>l'élément factuel diffusé à tous les membres de la cellule</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-green-800">• Décision :</span>
                  <span>les décisions prises pour faire avancer la crise par la cellule décisionnelle</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-orange-800">• Action :</span>
                  <span>les tâches à réaliser pour parvenir à un résultat</span>
                </div>
              </div>
            </div>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel élément
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvel élément RIDA</DialogTitle>
                <DialogDescription>
                  Ajouter une information, décision ou action au relevé
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4">
                {isUnsaved && (
                  <div className="flex items-center gap-2 text-orange-600 text-sm">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    non enregistré
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Sujet</Label>
                    <Input
                      value={newRidaItem.title}
                      onChange={(e) => {
                        setNewRidaItem({...newRidaItem, title: e.target.value});
                        setIsUnsaved(true);
                      }}
                      placeholder="Investigations, Messagerie, etc."
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select 
                      value={newRidaItem.type} 
                      onValueChange={(value: "I" | "D" | "A") => {
                        setNewRidaItem({...newRidaItem, type: value});
                        setIsUnsaved(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="I">I - Information</SelectItem>
                        <SelectItem value="D">D - Décision</SelectItem>
                        <SelectItem value="A">A - Action</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newRidaItem.notes}
                    onChange={(e) => {
                      setNewRidaItem({...newRidaItem, notes: e.target.value});
                      setIsUnsaved(true);
                    }}
                    placeholder="Description détaillée..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Porteur</Label>
                    <Input
                      value={newRidaItem.owner}
                      onChange={(e) => {
                        setNewRidaItem({...newRidaItem, owner: e.target.value});
                        setIsUnsaved(true);
                      }}
                      placeholder="Responsable"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>État</Label>
                    <Select 
                      value={newRidaItem.status} 
                      onValueChange={(value: string) => {
                        setNewRidaItem({...newRidaItem, status: value});
                        setIsUnsaved(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="À initier">À initier</SelectItem>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="En pause">En pause</SelectItem>
                        <SelectItem value="En retard">En retard</SelectItem>
                        <SelectItem value="Bloqué">Bloqué</SelectItem>
                        <SelectItem value="Terminé">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {newRidaItem.type === "A" && (
                  <div className="grid gap-2">
                    <Label>Échéance de l'action</Label>
                    <Input
                      type="date"
                      value={newRidaItem.dueDate}
                      onChange={(e) => {
                        setNewRidaItem({...newRidaItem, dueDate: e.target.value});
                        setIsUnsaved(true);
                      }}
                    />
                  </div>
                )}
                
                 <Button 
                  onClick={handleSave} 
                  className="w-full"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Ajouter l'élément"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* RIDA Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tableau RIDA</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Chargement des éléments RIDA...</p>
            </div>
          ) : ridaItems.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-100">
                    <TableHead className="w-20">Date</TableHead>
                    <TableHead className="w-20">Heure</TableHead>
                    <TableHead className="w-40">Sujet</TableHead>
                    <TableHead className="w-12 text-center">I</TableHead>
                    <TableHead className="w-12 text-center">D</TableHead>
                    <TableHead className="w-12 text-center">A</TableHead>
                    <TableHead className="w-32">Échéance de l'action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Porteur</TableHead>
                    <TableHead className="w-32">État</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ridaItems.map((item) => {
                    const createdDate = new Date(item.created_at);
                    const itemType = (item as any).type || 'I';
                    return (
                      <TableRow 
                        key={item.id} 
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          {createdDate.toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {createdDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="text-center">
                          {itemType === 'I' && (
                            <div className="w-6 h-6 mx-auto rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center">
                              <Info className="w-3 h-3 text-blue-600" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {itemType === 'D' && (
                            <div className="w-6 h-6 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {itemType === 'A' && (
                            <div className="w-6 h-6 mx-auto rounded-full border-2 border-orange-500 bg-orange-100 flex items-center justify-center">
                              <Clock className="w-3 h-3 text-orange-600" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {itemType === 'A' && (item as any).dueDate ? 
                            new Date((item as any).dueDate).toLocaleDateString('fr-FR') : 
                            '-'
                          }
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm line-clamp-2">{item.notes || '-'}</p>
                        </TableCell>
                        <TableCell>{item.owner || '-'}</TableCell>
                        <TableCell>
                          <Select
                            value={item.status}
                            onValueChange={(value: string) => updateItemStatus(item.id, value)}
                          >
                            <SelectTrigger className="w-full text-xs bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="À initier">À initier</SelectItem>
                              <SelectItem value="En cours">En cours</SelectItem>
                              <SelectItem value="En pause">En pause</SelectItem>
                              <SelectItem value="En retard">En retard</SelectItem>
                              <SelectItem value="Bloqué">Bloqué</SelectItem>
                              <SelectItem value="Terminé">Terminé</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRidaItem(item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun élément dans le relevé pour l'instant
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions d'utilisation du RIDA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instructions d'utilisation du RIDA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600">1.</span>
              <span>Notez de manière abrégée les informations, décisions et actions abordées en cellule de crise.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600">2.</span>
              <span>Indiquez le type du sujet. S'agit-il d'une information ? D'une décision ? D'une action ? Indiquez un I, D, ou A dans la colonne Type correspondante.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600">3.</span>
              <span>Notez qui est l'acteur/le porteur associé à ce sujet.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600">4.</span>
              <span>Précisez la date d'échéance s'il s'agit d'une action.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600">5.</span>
              <span>Lisez le RIDA à chaque point de situation afin de rappeler les décisions prises et les actions à réaliser pour faire le point d'avancement de ces actions.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}