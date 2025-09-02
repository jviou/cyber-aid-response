import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Upload, ExternalLink, FileText, Link as LinkIcon, Download } from "lucide-react";
import { uploadFile, listFiles, deleteFile, getFileUrl, ResourceFile } from "@/lib/resources";
import { toast } from "sonner";

interface ResourcesPageProps {
  sessionId: string;
}

export function ResourcesPage({ sessionId }: ResourcesPageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [resources, setResources] = useState<ResourceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [newResource, setNewResource] = useState({
    url: "",
    files: [] as File[]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadResources = async () => {
    try {
      setLoading(true);
      const files = await listFiles(sessionId);
      setResources(files);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error("Erreur lors du chargement des fichiers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [sessionId]);

  const handleAddFiles = async () => {
    if (newResource.files.length === 0 && !newResource.url) {
      toast.error("Sélectionnez des fichiers ou ajoutez une URL");
      return;
    }

    try {
      // Upload files
      for (const file of newResource.files) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const uploadedFile = await uploadFile(file, sessionId);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        // Add to local state immediately (optimistic UI)
        setResources(prev => [uploadedFile, ...prev]);
        toast.success(`${file.name} ajouté avec succès`);
      }

      // Clear upload progress
      setTimeout(() => {
        setUploadProgress({});
      }, 2000);

      setNewResource({
        url: "",
        files: []
      });
      setIsAddOpen(false);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error("Erreur lors de l'upload");
      setUploadProgress({});
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      try {
        await deleteFile(id);
        setResources(prev => prev.filter(r => r.id !== id));
        toast.success("Fichier supprimé");
      } catch (error) {
        console.error('Error deleting file:', error);
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
              Ajouter des fichiers
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Ajouter des fichiers</DialogTitle>
              <DialogDescription>
                Téléchargez des documents ou ajoutez des liens
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Fichiers</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Glissez-déposez vos fichiers ici ou cliquez pour parcourir
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Parcourir les fichiers
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {/* Selected files */}
                {newResource.files.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <Label className="text-sm">Fichiers sélectionnés:</Label>
                    {newResource.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload progress */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="space-y-2 mt-3">
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                      <div key={fileName} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{fileName}</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label>Ou ajouter un lien</Label>
                <Input
                  value={newResource.url}
                  onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                  placeholder="https://exemple.com/document.pdf"
                />
              </div>
              
              <Button 
                onClick={handleAddFiles} 
                className="w-full"
                disabled={newResource.files.length === 0 && !newResource.url}
              >
                Ajouter {newResource.files.length > 0 ? `${newResource.files.length} fichier(s)` : 'le lien'}
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
            <CardTitle className="text-sm font-medium">Fichiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taille totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(resources.reduce((acc, r) => acc + (r.size_bytes || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources List */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Chargement des fichiers...</p>
          </CardContent>
        </Card>
      ) : resources.length > 0 ? (
        <div className="space-y-3">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{resource.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{formatFileSize(resource.size_bytes)}</span>
                      <span>{formatDate(resource.added_at)}</span>
                    </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(resource)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>
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
              Aucun fichier pour cette session
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}