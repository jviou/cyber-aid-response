import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Clock, Plus, Calendar, User, Download, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from "sonner";
import { ActionItem, Priority } from "@/types/crisis";

type ActionStatus = "todo" | "doing" | "done";

interface LocalActionsBoardProps {
  actions: ActionItem[];
  onCreateAction: (actionData: Omit<ActionItem, 'id' | 'createdAt'>) => void;
  onUpdateAction: (id: string, updates: Partial<ActionItem>) => void;
  onDeleteAction: (id: string) => void;
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-red-100 text-red-800"
};

const statusColumns = {
  todo: { title: "À faire", color: "bg-slate-50" },
  doing: { title: "En cours", color: "bg-blue-50" },
  done: { title: "Terminé", color: "bg-green-50" }
};

export function LocalActionsBoard({ actions, onCreateAction, onUpdateAction, onDeleteAction }: LocalActionsBoardProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAction, setNewAction] = useState({
    title: "",
    description: "",
    owner: "",
    priority: "medium" as Priority,
    status: "todo" as ActionStatus,
    dueAt: ""
  });

  const actionsByStatus = useMemo(() => {
    const source = actions ?? [];
    const grouped = {
      todo: source.filter(a => a.status === "todo"),
      doing: source.filter(a => a.status === "doing"),
      done: source.filter(a => a.status === "done")
    };
    return grouped;
  }, [actions]);

  const handleAddAction = () => {
    if (!newAction.title) {
      toast.error("Le titre est requis");
      return;
    }

    onCreateAction({
      title: newAction.title,
      description: newAction.description || undefined,
      owner: newAction.owner || undefined,
      priority: newAction.priority,
      status: newAction.status,
      dueAt: newAction.dueAt || undefined
    });

    setNewAction({ 
      title: "", 
      description: "", 
      owner: "", 
      priority: "medium", 
      status: "todo",
      dueAt: "" 
    });
    setIsAddOpen(false);
    
    toast.success("Action créée avec succès");
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as ActionStatus;
    
    onUpdateAction(draggableId, { status: newStatus });
    toast.success(`Action déplacée vers ${statusColumns[newStatus].title}`);
  };

  const exportCSV = () => {
    const headers = ["Titre", "Description", "Propriétaire", "Priorité", "Statut", "Échéance", "Créé le"];
    const csvData = (actions ?? []).map(action => [
      action.title,
      action.description || "",
      action.owner || "",
      action.priority || "",
      action.status,
      action.dueAt ? new Date(action.dueAt).toLocaleString('fr-FR') : "",
      new Date(action.createdAt).toLocaleString('fr-FR')
    ]);
    
    const csv = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `actions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Actions exportées en CSV");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) {
      return <span className="text-destructive">En retard</span>;
    } else if (diff < 24 * 60 * 60 * 1000) {
      return <span className="text-warning">Aujourd'hui</span>;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Actions</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des actions de la cellule de crise
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Action
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle Action</DialogTitle>
                <DialogDescription>
                  Créer une nouvelle action à traiter
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Titre</Label>
                  <Input 
                    value={newAction.title}
                    onChange={(e) => setNewAction({...newAction, title: e.target.value})}
                    placeholder="Titre de l'action"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newAction.description}
                    onChange={(e) => setNewAction({...newAction, description: e.target.value})}
                    placeholder="Description détaillée (optionnel)"
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Propriétaire</Label>
                  <Input 
                    value={newAction.owner}
                    onChange={(e) => setNewAction({...newAction, owner: e.target.value})}
                    placeholder="Personne responsable"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Priorité</Label>
                  <Select value={newAction.priority} onValueChange={(value: Priority) => setNewAction({...newAction, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Élevée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Échéance (optionnel)</Label>
                  <Input 
                    type="datetime-local"
                    value={newAction.dueAt}
                    onChange={(e) => setNewAction({...newAction, dueAt: e.target.value})}
                  />
                </div>
                
                <Button onClick={handleAddAction} className="w-full">
                  Créer l'Action
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="table">Tableau</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(statusColumns).map(([status, config]) => (
                <div key={status} className={`rounded-lg p-4 ${config.color}`}>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    {config.title}
                    <Badge variant="secondary">
                      {actionsByStatus[status as keyof typeof actionsByStatus].length}
                    </Badge>
                  </h3>
                  
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-96 space-y-3 ${snapshot.isDraggingOver ? 'bg-muted/50 rounded-lg p-2' : ''}`}
                      >
                        {actionsByStatus[status as keyof typeof actionsByStatus].map((action, index) => (
                          <Draggable key={action.id} draggableId={action.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-sm">{action.title}</h4>
                                    {action.priority && (
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${priorityColors[action.priority]}`}
                                      >
                                        {action.priority === 'low' ? 'Faible' : 
                                         action.priority === 'medium' ? 'Moyenne' : 'Élevée'}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {action.description && (
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                      {action.description}
                                    </p>
                                  )}
                                  
                                   <div className="flex items-center justify-between text-xs text-muted-foreground">
                                     <div className="flex items-center gap-1">
                                       {action.owner && (
                                         <>
                                           <User className="w-3 h-3" />
                                           <span>{action.owner}</span>
                                         </>
                                       )}
                                       {action.dueAt && (
                                         <div className="flex items-center gap-1 ml-2">
                                           <Calendar className="w-3 h-3" />
                                           {formatDate(action.dueAt)}
                                         </div>
                                       )}
                                     </div>
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         onDeleteAction(action.id);
                                       }}
                                       className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                     >
                                       <Trash2 className="w-3 h-3" />
                                     </Button>
                                   </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </TabsContent>
        
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Vue Tableau</CardTitle>
              <CardDescription>
                Toutes les actions en format tableau
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Propriétaire</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(actions ?? [])
                    .sort((a, b) => {
                      const priorityOrder = { high: 3, medium: 2, low: 1 };
                      return (priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low']) || 
                             new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    })
                    .map((action) => (
                      <TableRow key={action.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{action.title}</div>
                            {action.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {action.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{action.owner || "Non assigné"}</TableCell>
                        <TableCell>
                          {action.priority && (
                            <Badge 
                              variant="outline" 
                              className={priorityColors[action.priority]}
                            >
                              {action.priority === 'low' ? 'Faible' : 
                               action.priority === 'medium' ? 'Moyenne' : 'Élevée'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            action.status === 'done' ? 'default' :
                            action.status === 'doing' ? 'secondary' : 'outline'
                          }>
                            {statusColumns[action.status].title}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {action.dueAt ? formatDate(action.dueAt) : "—"}
                        </TableCell>
                        <TableCell>
                          {new Date(action.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteAction(action.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              
              {(actions ?? []).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune action créée pour l'instant
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}