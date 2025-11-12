import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock, User, Info, CheckCircle, AlertCircle } from "lucide-react";
import { Decision } from "@/types/crisis";
import { toast } from "sonner";
import { useCrisisState } from "@/hooks/useCrisisState";

interface RIDAItem {
  id: string;
  date: string;
  time: string;
  subject: string;
  type: 'I' | 'D' | 'A'; // Information, Décision, Action
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
  const { state, updateState } = useCrisisState();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RIDAItem | null>(null);
  
  const ridaItems = state.rida;
  
  const [newRidaItem, setNewRidaItem] = useState({
    subject: "",
    type: "D" as 'I' | 'D' | 'A',
    description: "",
    owner: "",
    status: "À initier" as RIDAItem['status'],
    dueDate: ""
  });

  const handleAddRidaItem = () => {
    if (!newRidaItem.subject || !newRidaItem.description) {
      toast.error("Sujet et description sont requis");
      return;
    }

    const now = new Date();
    const newItem: RIDAItem = {
      id: Date.now().toString(),
      date: now.toLocaleDateString('fr-FR'),
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      subject: newRidaItem.subject,
      type: newRidaItem.type,
      description: newRidaItem.description,
      owner: newRidaItem.owner,
      status: newRidaItem.status,
      dueDate: newRidaItem.dueDate || undefined
    };

    updateState(state => ({
      ...state,
      rida: [...state.rida, newItem]
    }));
    
    setNewRidaItem({
      subject: "",
      type: "D",
      description: "",
      owner: "",
      status: "À initier",
      dueDate: ""
    });
    setIsAddOpen(false);
    
    toast.success("Élément RIDA ajouté");
  };

  const handleDeleteRidaItem = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      updateState(state => ({
        ...state,
        rida: state.rida.filter(item => item.id !== id)
      }));
      toast.success("Élément supprimé");
    }
  };

  const updateItemStatus = (id: string, newStatus: RIDAItem['status']) => {
    updateState(state => ({
      ...state,
      rida: state.rida.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      )
    }));
  };

  const getStatusBadgeVariant = (status: RIDAItem['status']) => {
    switch (status) {
      case 'À initier': return 'outline';
      case 'En cours': return 'default';
      case 'En pause': return 'secondary';
      case 'En retard': return 'destructive';
      case 'Bloqué': return 'destructive';
      case 'Terminé': return 'default';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: RIDAItem['status']) => {
    switch (status) {
      case 'À initier': return 'bg-gray-100';
      case 'En cours': return 'bg-yellow-100';
      case 'En pause': return 'bg-orange-100';
      case 'En retard': return 'bg-blue-100';
      case 'Bloqué': return 'bg-red-100';
      case 'Terminé': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };

  const getTypeIcon = (type: 'I' | 'D' | 'A') => {
    switch (type) {
      case 'I': return <Info className="w-4 h-4 text-blue-600" />;
      case 'D': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'A': return <AlertCircle className="w-4 h-4 text-orange-600" />;
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Sujet</Label>
                    <Input
                      value={newRidaItem.subject}
                      onChange={(e) => setNewRidaItem({...newRidaItem, subject: e.target.value})}
                      placeholder="Investigations, Messagerie, etc."
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select 
                      value={newRidaItem.type} 
                      onValueChange={(value: 'I' | 'D' | 'A') => setNewRidaItem({...newRidaItem, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                    value={newRidaItem.description}
                    onChange={(e) => setNewRidaItem({...newRidaItem, description: e.target.value})}
                    placeholder="Description détaillée..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Porteur</Label>
                    <Input
                      value={newRidaItem.owner}
                      onChange={(e) => setNewRidaItem({...newRidaItem, owner: e.target.value})}
                      placeholder="Responsable"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>État</Label>
                    <Select 
                      value={newRidaItem.status} 
                      onValueChange={(value: RIDAItem['status']) => setNewRidaItem({...newRidaItem, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                
                {newRidaItem.type === 'A' && (
                  <div className="grid gap-2">
                    <Label>Échéance (optionnel)</Label>
                    <Input
                      type="date"
                      value={newRidaItem.dueDate}
                      onChange={(e) => setNewRidaItem({...newRidaItem, dueDate: e.target.value})}
                    />
                  </div>
                )}
                
                <Button onClick={handleAddRidaItem} className="w-full">
                  Ajouter l'élément
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p className="mb-2"><strong>Le relevé comprend :</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <p>• <strong>Information</strong> : l'élément factuel diffusé à tous les membres de la cellule</p>
            <p>• <strong>Décision</strong> : les décisions prises pour faire avancer la crise par la cellule décisionnelle</p>
            <p>• <strong>Action</strong> : les tâches à réaliser pour parvenir à un résultat</p>
          </div>
        </div>
      </div>

      {/* RIDA Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tableau RIDA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-100">
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead className="w-20">Heure</TableHead>
                  <TableHead className="w-32">Sujet</TableHead>
                  <TableHead className="w-8 text-center">I</TableHead>
                  <TableHead className="w-8 text-center">D</TableHead>
                  <TableHead className="w-8 text-center">A</TableHead>
                  <TableHead className="w-32">Échéance de l'action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Porteur</TableHead>
                  <TableHead className="w-24">État</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ridaItems.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <TableCell className="font-medium">{item.date}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell className="font-medium">{item.subject}</TableCell>
                    <TableCell className="text-center">
                      {item.type === 'I' && getTypeIcon('I')}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.type === 'D' && getTypeIcon('D')}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.type === 'A' && getTypeIcon('A')}
                    </TableCell>
                    <TableCell>{item.dueDate || '-'}</TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm line-clamp-2">{item.description}</p>
                    </TableCell>
                    <TableCell>{item.owner}</TableCell>
                    <TableCell>
                      <Select
                        value={item.status}
                        onValueChange={(value: RIDAItem['status']) => updateItemStatus(item.id, value)}
                      >
                        <SelectTrigger className={`w-full text-xs ${getStatusColor(item.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                        onClick={(e) => handleDeleteRidaItem(item.id, e)}
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
          
          {ridaItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun élément dans le relevé pour l'instant
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-3">Instructions d'utilisation du RIDA</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>1.</strong> Notez de manière abrégée les informations, décisions et actions abordées en cellule de crise.</p>
            <p><strong>2.</strong> Indiquez le type du sujet. S'agit-il d'une information ? D'une décision ? D'une action ? Indiquez un I, D, ou A dans la colonne Type correspondante.</p>
            <p><strong>3.</strong> Notez qui est l'acteur/le porteur associé à ce sujet.</p>
            <p><strong>4.</strong> Précisez la date d'échéance s'il s'agit d'une action.</p>
            <p><strong>5.</strong> Lisez le RIDA à chaque point de situation afin de rappeler les décisions prises et les actions à réaliser pour faire le point d'avancement de ces actions.</p>
          </div>
        </CardContent>
      </Card>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && getTypeIcon(selectedItem.type)}
              {selectedItem?.subject}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.type === 'I' && 'Information'} 
              {selectedItem?.type === 'D' && 'Décision'} 
              {selectedItem?.type === 'A' && 'Action'} 
              · Ajouté le {selectedItem?.date} à {selectedItem?.time}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Porteur</Label>
                  <p className="text-sm mt-1">{selectedItem.owner || 'Non assigné'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">État</Label>
                  <div className="mt-1">
                    <Badge 
                      variant={getStatusBadgeVariant(selectedItem.status)}
                      className={`${getStatusColor(selectedItem.status)} text-black`}
                    >
                      {selectedItem.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {selectedItem.dueDate && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Échéance</Label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedItem.dueDate}
                  </p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description complète</Label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedItem.description}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}