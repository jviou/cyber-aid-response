import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Upload, ExternalLink, FileText, Link as LinkIcon, Download, Loader2 } from "lucide-react";
import { uploadFile, listFiles, deleteFile, getFileUrl, ResourceFile } from "@/lib/resources";
import { toast } from "sonner";
import { saveResource, supabase, DEFAULT_SESSION_ID } from "@/lib/db";
import type { Database } from "@/integrations/supabase/types";

interface ResourcesPageProps {
  sessionId: string;
}

type DBResourceItem = Database['public']['Tables']['resource_item']['Row'];

export function ResourcesPage({ sessionId }: ResourcesPageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [resources, setResources] = useState<DBResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [newResource, setNewResource] = useState({
    name: "",
    type: "",
    location: "",
    contact: "",
    notes: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadResources = async () => {
    try {
      setLoading(true);
      const sessionId = await DEFAULT_SESSION_ID();
      const { data, error } = await supabase
        .from('resource_item')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error("Erreur lors du chargement des ressources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Realtime subscription
  useEffect(() => {
    let channel: any;
    
    const setupRealtimeSubscription = async () => {
      const sessionId = await DEFAULT_SESSION_ID();
      
      channel = supabase
        .channel('resource-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'resource_item',
          filter: `session_id=eq.${sessionId}`
        }, () => {
          loadResources();
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
    if (!newResource.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    setIsSaving(true);
    try {
      await saveResource(newResource);
      toast.success("Ressource ajoutée avec succès");
      
      setNewResource({
        name: "",
        type: "",
        location: "",
        contact: "",
        notes: ""
      });
      setIsAddOpen(false);
      setIsUnsaved(false);
      await loadResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) {
      try {
        const { error } = await supabase
          .from('resource_item')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success("Ressource supprimée");
        await loadResources();
      } catch (error) {
        console.error('Error deleting resource:', error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setNewResource({
      ...newResource,
      files: [...newResource.files, ...selectedFiles]
    });
  };

  const handleDownload = async (resource: ResourceFile) => {
    try {
      const url = await getFileUrl(resource.blob_key || '');
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const removeFile = (index: number) => {
    setNewResource({
      ...newResource,
      files: newResource.files.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ressources</h1>
          <p className="text-muted-foreground mt-2">
            Documents, liens et fichiers utiles pour la gestion de crise
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une ressource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Ajouter une ressource</DialogTitle>
              <DialogDescription>
                Ajouter une nouvelle ressource à la liste
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
                <Label>Nom *</Label>
                <Input
                  value={newResource.name}
                  onChange={(e) => {
                    setNewResource({...newResource, name: e.target.value});
                    setIsUnsaved(true);
                  }}
                  placeholder="Nom de la ressource..."
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Type</Label>
                <Input
                  value={newResource.type}
                  onChange={(e) => {
                    setNewResource({...newResource, type: e.target.value});
                    setIsUnsaved(true);
                  }}
                  placeholder="Type de ressource (ex: équipement, personnel, etc.)"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Localisation</Label>
                <Input
                  value={newResource.location}
                  onChange={(e) => {
                    setNewResource({...newResource, location: e.target.value});
                    setIsUnsaved(true);
                  }}
                  placeholder="Lieu où se trouve la ressource"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Contact</Label>
                <Input
                  value={newResource.contact}
                  onChange={(e) => {
                    setNewResource({...newResource, contact: e.target.value});
                    setIsUnsaved(true);
                  }}
                  placeholder="Personne ou service de contact"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea
                  value={newResource.notes}
                  onChange={(e) => {
                    setNewResource({...newResource, notes: e.target.value});
                    setIsUnsaved(true);
                  }}
                  placeholder="Notes additionnelles..."
                  rows={3}
                />
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ressources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(resources.map(r => r.type).filter(Boolean))].length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement des ressources...</p>
        </div>
      ) : resources.length > 0 ? (
        <div className="space-y-3">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{resource.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {resource.type && <span>Type: {resource.type}</span>}
                        {resource.location && <span>Lieu: {resource.location}</span>}
                        {resource.contact && <span>Contact: {resource.contact}</span>}
                      </div>
                      {resource.notes && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {resource.notes}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(resource.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResource(resource.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucune ressource pour cette session
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}