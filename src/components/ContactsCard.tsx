import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Plus, Edit2, Trash2, Phone } from "lucide-react";
import { KeyContact } from "@/types/crisis";
import { useToast } from "@/hooks/use-toast";

interface ContactsCardProps {
  contacts: KeyContact[];
  onUpdateContacts: (contacts: KeyContact[]) => void;
}

export function ContactsCard({ contacts, onUpdateContacts }: ContactsCardProps) {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<KeyContact | null>(null);
  const [newContact, setNewContact] = useState({
    name: "",
    role: "",
    contact: ""
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.role) {
      toast({
        title: "Erreur",
        description: "Nom et rôle sont requis",
        variant: "destructive"
      });
      return;
    }

    const contacts_updated = [...contacts, { ...newContact }];
    onUpdateContacts(contacts_updated);
    
    setNewContact({ name: "", role: "", contact: "" });
    setIsAddOpen(false);
    
    toast({
      title: "Contact ajouté",
      description: "Le contact a été ajouté à la liste"
    });
  };

  const handleEditContact = (contact: KeyContact) => {
    setEditingContact(contact);
    setNewContact({ 
      name: contact.name, 
      role: contact.role, 
      contact: contact.contact || "" 
    });
  };

  const handleUpdateContact = () => {
    if (!newContact.name || !newContact.role) {
      toast({
        title: "Erreur", 
        description: "Nom et rôle sont requis",
        variant: "destructive"
      });
      return;
    }

    const contacts_updated = contacts.map(c => 
      c === editingContact ? { ...newContact } : c
    );
    onUpdateContacts(contacts_updated);
    
    setEditingContact(null);
    setNewContact({ name: "", role: "", contact: "" });
    
    toast({
      title: "Contact modifié",
      description: "Les informations ont été mises à jour"
    });
  };

  const handleDeleteContact = (contactToDelete: KeyContact) => {
    const contacts_updated = contacts.filter(c => c !== contactToDelete);
    onUpdateContacts(contacts_updated);
    
    toast({
      title: "Contact supprimé",
      description: "Le contact a été retiré de la liste"
    });
  };

  const resetForm = () => {
    setNewContact({ name: "", role: "", contact: "" });
    setEditingContact(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Contacts clés
          </CardTitle>
          <Dialog 
            open={isAddOpen || editingContact !== null} 
            onOpenChange={(open) => {
              if (!open) {
                setIsAddOpen(false);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? "Modifier le contact" : "Nouveau contact"}
                </DialogTitle>
                <DialogDescription>
                  {editingContact 
                    ? "Modifier les informations du contact" 
                    : "Ajouter un nouveau contact à la cellule de crise"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Nom</Label>
                  <Input 
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="Nom et prénom"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Rôle</Label>
                  <Input 
                    value={newContact.role}
                    onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                    placeholder="Fonction dans la cellule de crise"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Contact</Label>
                  <Input 
                    value={newContact.contact}
                    onChange={(e) => setNewContact({...newContact, contact: e.target.value})}
                    placeholder="Téléphone, email..."
                  />
                </div>
                
                <Button 
                  onClick={editingContact ? handleUpdateContact : handleAddContact} 
                  className="w-full"
                >
                  {editingContact ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact, index) => (
            <div key={index} className="p-3 bg-muted/50 rounded-lg relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleEditContact(contact)}
                  className="h-6 w-6 p-0"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleDeleteContact(contact)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <h4 className="font-semibold pr-12">{contact.name}</h4>
              <p className="text-sm text-muted-foreground">{contact.role}</p>
              {contact.contact && (
                <p className="text-sm font-mono mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {contact.contact}
                </p>
              )}
            </div>
          ))}
        </div>
        
        {contacts.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Aucun contact ajouté</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}