import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { User, Mail } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInAnonymous, signInWithEmail } = useAuth();

  const handleAnonymousLogin = async () => {
    if (!displayName.trim()) return;
    
    setLoading(true);
    const result = await signInAnonymous();
    setLoading(false);
    
    if (result.success) {
      onSuccess();
      onClose();
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim()) return;
    
    setLoading(true);
    const result = await signInWithEmail();
    setLoading(false);
    
    if (result.success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connexion à la Session</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="anonymous" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="anonymous">Anonyme</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="anonymous" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nom d'affichage</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  placeholder="Votre nom..."
                  className="pl-10"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnonymousLogin()}
                />
              </div>
            </div>
            <Button 
              onClick={handleAnonymousLogin} 
              disabled={!displayName.trim() || loading}
              className="w-full"
            >
              {loading ? "Connexion..." : "Rejoindre la session"}
            </Button>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
                />
              </div>
            </div>
            <Button 
              onClick={handleEmailLogin} 
              disabled={!email.trim() || loading}
              className="w-full"
            >
              {loading ? "Envoi..." : "Envoyer lien magic"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}