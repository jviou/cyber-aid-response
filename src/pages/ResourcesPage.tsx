import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, ExternalLink, FileText, Link as LinkIcon } from "lucide-react";
import { Resource } from "@/types/crisis";
import { toast } from "sonner";

interface ResourcesPageProps {
  resources: Resource[];
  onCreateResource: (resourceData: Omit<Resource, 'id'>) => void;
  onDeleteResource: (id: string) => void;
}

export function ResourcesPage({ resources, onCreateResource, onDeleteResource }: ResourcesPageProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    url: "",
    note: "",
    tags: [] as string[],
    file: null as File | null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddResource = () => {
    if (!newResource.title) {
      toast.error("Le titre est requis");
      return;
    }

    // Handle file upload (in a real app, you'd upload to a server)
    let fileUrl = newResource.url;
    if (newResource.file) {
      // For demo purposes, create a blob URL
      fileUrl = URL.createObjectURL(newResource.file);
    }

    onCreateResource({
      title: newResource.title,
      url: fileUrl,
      note: newResource.note,
      tags: newResource.tags.filter(tag => tag.trim() !== "")
    });

    setNewResource({
      title: "",
      url: "",
      note: "",
      tags: [],
      file: null
    });
    setIsAddOpen(false);
    
    toast.success("Ressource ajoutée");
  };

  const handleDeleteResource = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) {
      onDeleteResource(id);
      toast.success("Ressource supprimée");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewResource({
        ...newResource,
        file,
        title: newResource.title || file.name
      });
    }
  };

  const handleAddTag = () => {
    setNewResource({
      ...newResource,
      tags: [...newResource.tags, ""]
    });
  };

  const handleUpdateTag = (index: number, value: string) => {
    const updatedTags = [...newResource.tags];
    updatedTags[index] = value;
    setNewResource({
      ...newResource,
      tags: updatedTags
    });
  };

  const handleRemoveTag = (index: number) => {
    setNewResource({
      ...newResource,
      tags: newResource.tags.filter((_, i) => i !== index)
    });
  };

  const getResourceIcon = (resource: Resource) => {
    if (resource.url?.startsWith('blob:')) {
      return <FileText className="w-5 h-5" />;
    } else if (resource.url) {
      return <ExternalLink className="w-5 h-5" />;
    } else {
      return <LinkIcon className="w-5 h-5" />;
    }
  };

  const handleResourceClick = (resource: Resource) => {
    if (resource.url) {
      if (resource.url.startsWith('blob:')) {
        // For blob URLs, open in new tab
        window.open(resource.url, '_blank');
      } else {
        // For external URLs
        window.open(resource.url, '_blank', 'noopener,noreferrer');
      }
    }
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
              Ajouter une Ressource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Nouvelle Ressource</DialogTitle>
              <DialogDescription>
                Ajouter un document, un lien ou un fichier
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Titre</Label>
                <Input
                  value={newResource.title}
                  onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                  placeholder="Nom de la ressource"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Fichier ou URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={newResource.url}
                    onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                    placeholder="https://... ou laissez vide pour un fichier"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Fichier
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {newResource.file && (
                  <p className="text-sm text-muted-foreground">
                    Fichier sélectionné: {newResource.file.name}
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label>Note</Label>
                <Textarea
                  value={newResource.note}
                  onChange={(e) => setNewResource({...newResource, note: e.target.value})}
                  placeholder="Description ou note sur cette ressource"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Tags</Label>
                {newResource.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={tag}
                      onChange={(e) => handleUpdateTag(index, e.target.value)}
                      placeholder={`Tag ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTag(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un tag
                </Button>
              </div>
              
              <Button onClick={handleAddResource} className="w-full">
                Ajouter la Ressource
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
            <div className="text-2xl font-bold">
              {resources.filter(r => r.url?.startsWith('blob:')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Liens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resources.filter(r => r.url && !r.url.startsWith('blob:')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources Grid */}
      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getResourceIcon(resource)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-1">{resource.title}</CardTitle>
                      {resource.note && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {resource.note}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteResource(resource.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-muted px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {resource.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResourceClick(resource)}
                    className="w-full"
                  >
                    {resource.url.startsWith('blob:') ? 'Ouvrir le fichier' : 'Ouvrir le lien'}
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucune ressource ajoutée pour l'instant
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}