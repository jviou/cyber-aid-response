import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Clock, Plus, Copy, Mail, Send } from "lucide-react";
import { CrisisSession, Communication } from "@/types/crisis";
import { communicationTemplates } from "@/data/crisisData";
import { useToast } from "@/hooks/use-toast";

interface CommunicationsPageProps {
  session: CrisisSession;
  onUpdateSession: (updater: (session: CrisisSession) => CrisisSession) => void;
}

export function CommunicationsPage({ session, onUpdateSession }: CommunicationsPageProps) {
  const { toast } = useToast();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newComm, setNewComm] = useState({
    audience: "",
    subject: "",
    message: "",
    author: ""
  });

  const handleUseTemplate = (templateKey: string) => {
    const template = communicationTemplates[templateKey];
    setNewComm({
      audience: template.audience,
      subject: template.title,
      message: template.message,
      author: ""
    });
    setIsComposeOpen(true);
  };

  const handleCopyTemplate = async (templateKey: string) => {
    const template = communicationTemplates[templateKey];
    try {
      await navigator.clipboard.writeText(template.message);
      toast({
        title: "Template copié",
        description: "Le contenu a été copié dans le presse-papiers"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le template",
        variant: "destructive"
      });
    }
  };

  const handleSaveComm = () => {
    if (!newComm.audience || !newComm.subject || !newComm.message) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "destructive"
      });
      return;
    }

    const communication: Communication = {
      id: `comm-${Date.now()}`,
      audience: newComm.audience,
      subject: newComm.subject,
      message: newComm.message,
      author: newComm.author || "Utilisateur",
      sentAt: new Date().toISOString()
    };

    onUpdateSession(session => ({
      ...session,
      communications: [...session.communications, communication]
    }));

    setNewComm({ audience: "", subject: "", message: "", author: "" });
    setIsComposeOpen(false);
    
    toast({
      title: "Communication sauvegardée",
      description: "La communication a été enregistrée"
    });
  };

  const handleCopyComm = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "Message copié",
        description: "Le contenu a été copié dans le presse-papiers"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le message",
        variant: "destructive"
      });
    }
  };

  const handleMailto = (comm: Communication) => {
    const subject = encodeURIComponent(comm.subject);
    const body = encodeURIComponent(comm.message);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const getAudienceBadgeColor = (audience: string) => {
    const colors: Record<string, string> = {
      "Interne": "bg-blue-100 text-blue-800",
      "Direction": "bg-purple-100 text-purple-800",
      "DPO": "bg-green-100 text-green-800",
      "ANSSI": "bg-red-100 text-red-800",
      "CNIL": "bg-orange-100 text-orange-800",
      "Partenaires": "bg-gray-100 text-gray-800"
    };
    return colors[audience] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communications</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des communications de crise avec templates prédéfinis
          </p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Composer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Composer une Communication</DialogTitle>
              <DialogDescription>
                Créer une nouvelle communication de crise
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Audience</Label>
                <Input 
                  value={newComm.audience}
                  onChange={(e) => setNewComm({...newComm, audience: e.target.value})}
                  placeholder="Ex: Direction, DPO, Interne..."
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Sujet</Label>
                <Input 
                  value={newComm.subject}
                  onChange={(e) => setNewComm({...newComm, subject: e.target.value})}
                  placeholder="Objet de la communication"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Message</Label>
                <Textarea
                  value={newComm.message}
                  onChange={(e) => setNewComm({...newComm, message: e.target.value})}
                  placeholder="Contenu de la communication..."
                  rows={8}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Auteur</Label>
                <Input 
                  value={newComm.author}
                  onChange={(e) => setNewComm({...newComm, author: e.target.value})}
                  placeholder="Nom de l'expéditeur"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSaveComm} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleCopyComm(newComm.message)}
                  disabled={!newComm.message}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copier
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Historique ({session.communications.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates Prédéfinis</CardTitle>
              <CardDescription>
                Modèles de communication prêts à l'emploi pour différentes audiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(communicationTemplates).map(([key, template]) => (
                  <Card key={key} className="border border-muted">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.title}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={getAudienceBadgeColor(template.audience)}
                        >
                          {template.audience}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {template.message.substring(0, 150)}...
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleUseTemplate(key)}
                          className="flex-1"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Utiliser
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCopyTemplate(key)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {session.communications.length > 0 ? (
            <div className="space-y-4">
              {session.communications
                .sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime())
                .map((comm) => (
                  <Card key={comm.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{comm.subject}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline"
                              className={getAudienceBadgeColor(comm.audience)}
                            >
                              {comm.audience}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {comm.sentAt && new Date(comm.sentAt).toLocaleString('fr-FR')}
                              {comm.author && ` • par ${comm.author}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCopyComm(comm.message)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copier
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMailto(comm)}
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-md">
                        {comm.message}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Aucune communication envoyée pour l'instant
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}