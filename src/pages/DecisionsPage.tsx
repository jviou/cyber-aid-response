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
import { saveRida, supabase, DEFAULT_SESSION_ID } from "@/lib/db";
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

type DBRidaEntry = Database['public']['Tables']['rida_entry']['Row'];

export function DecisionsPage({ decisions, onCreateDecision, onDeleteDecision }: DecisionsPageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RIDAItem | null>(null);
  const [ridaItems, setRidaItems] = useState<DBRidaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnsaved, setIsUnsaved] = useState(false);
  
  const [newRidaItem, setNewRidaItem] = useState({
    title: "",
    status: "nouveau" as string,
    owner: "",
    notes: ""
  });

  // Load RIDA items from database
  const loadRidaItems = async () => {
    try {
      setLoading(true);
      const sessionId = await DEFAULT_SESSION_ID();
      const { data, error } = await supabase
        .from('rida_entry')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRidaItems(data || []);
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
    let channel: any;
    
    const setupRealtimeSubscription = async () => {
      const sessionId = await DEFAULT_SESSION_ID();
      
      channel = supabase
        .channel('rida-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'rida_entry',
          filter: `session_id=eq.${sessionId}`
        }, () => {
          loadRidaItems();
        })
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
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
        status: "nouveau",
        owner: "",
        notes: ""
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
        const { error } = await supabase
          .from('rida_entry')
          .delete()
          .eq('id', id);

        if (error) throw error;
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
        .update({ status: newStatus, updated_at: new Date().toISOString() })
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
              Le RIDA est un outil de gestion de projet qui permet de retrouver les différentes informations transmises lors d'une crise dans un document.
            </p>
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
                
                <div className="grid gap-2">
                  <Label>Titre *</Label>
                  <Input
                    value={newRidaItem.title}
                    onChange={(e) => {
                      setNewRidaItem({...newRidaItem, title: e.target.value});
                      setIsUnsaved(true);
                    }}
                    placeholder="Titre de l'élément RIDA..."
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newRidaItem.notes}
                    onChange={(e) => {
                      setNewRidaItem({...newRidaItem, notes: e.target.value});
                      setIsUnsaved(true);
                    }}
                    placeholder="Notes détaillées..."
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
                      onValueChange={(value) => {
                        setNewRidaItem({...newRidaItem, status: value});
                        setIsUnsaved(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nouveau">Nouveau</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="clos">Clos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
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
                    'Sauvegarder'
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
                    <TableHead className="w-32">Date</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-24">Porteur</TableHead>
                    <TableHead className="w-24">État</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ridaItems.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm line-clamp-2">{item.notes || '-'}</p>
                      </TableCell>
                      <TableCell>{item.owner || '-'}</TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onValueChange={(value: string) => updateItemStatus(item.id, value)}
                        >
                          <SelectTrigger className={`w-full text-xs ${getStatusColor(item.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nouveau">Nouveau</SelectItem>
                            <SelectItem value="en_cours">En cours</SelectItem>
                            <SelectItem value="clos">Clos</SelectItem>
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
                  ))}
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
    </div>
  );
}