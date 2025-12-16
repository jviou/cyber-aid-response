import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Download,
  Upload,
  RotateCcw,
  Menu,
  Save,
  Wifi,
  WifiOff
} from "lucide-react";
import { useCrisisState } from "@/hooks/useCrisisState";
import { importJSON } from "@/lib/stateStore";
import { toast } from "sonner";

export function SessionHeader() {
  const { state, updateState, socket } = useCrisisState();
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `crisis-session-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Session exportée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedState = await importJSON(file);
      // Update local state AND broadcast via socket (handled by updateState implementation)
      updateState(() => importedState);

      // Explicitly emit import event if we want easier server logging, 
      // but client-update covers it. 
      // User asked for "Import JSON : charger un JSON et remplacer l’état actif"
      // Sending it via updateState triggers client-update.

      toast.success("Session importée avec succès (Synchronisation en cours...)");
    } catch (error) {
      toast.error("Erreur lors de l'import");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser la session ? TOUS LES CLIENTS seront réinitialisés/effacés.")) {
      return;
    }

    setIsResetting(true);
    try {
      if (socket && socket.connected) {
        socket.emit("reset-session");
        toast.success("Réinitialisation envoyée au serveur");
      } else {
        toast.error("Impossible de réinitialiser : Non connecté au serveur");
      }
    } catch (error) {
      console.error('Error resetting session:', error);
      toast.error("Erreur lors de la réinitialisation");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSave = async () => {
    // In real-time mode, saving is automatic. 
    // This button can be a manual trigger to re-sync or just a visual confirmation.
    if (socket && socket.connected) {
      // Force emit current state
      socket.emit("client-update", state);
      toast.success("État synchronisé avec le serveur");
    } else {
      toast.error("Erreur : Non connecté au serveur");
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{state.meta.title}</h1>
          {/* Visual connection indicator */}
          {socket?.connected ? (
            <div title="Connecté" className="flex items-center text-green-500 text-xs gap-1">
              <Wifi className="w-4 h-4" />
            </div>
          ) : (
            <div title="Déconnecté" className="flex items-center text-destructive text-xs gap-1">
              <WifiOff className="w-4 h-4" />
              Déconnecté
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="w-4 h-4 mr-2" />
                Session
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exporter JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Importer JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleReset}
                disabled={isResetting}
                className="text-destructive focus:text-destructive"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {isResetting ? 'Réinitialisation...' : 'Réinitialiser Tout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
