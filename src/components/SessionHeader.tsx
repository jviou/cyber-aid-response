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
  Save
} from "lucide-react";
import { useCrisisState } from "@/hooks/useCrisisState";
import { importJSON, resetSession } from "@/lib/stateStore";
import { toast } from "sonner";

export function SessionHeader() {
  const { state, sessionId, updateState } = useCrisisState();
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
      updateState(() => importedState);
      toast.success("Session importée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'import");
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser la session ? Toutes les données seront perdues.")) {
      return;
    }

    setIsResetting(true);
    try {
      await resetSession(sessionId);
      // Reload the page to reinitialize everything
      window.location.reload();
    } catch (error) {
      console.error('Error resetting session:', error);
      toast.error("Erreur lors de la réinitialisation");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSave = async () => {
    try {
      localStorage.setItem(`crisis-state-${sessionId}`, JSON.stringify(state));
      toast.success("Session sauvegardée");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{state.meta.title}</h1>
          <div className="text-sm text-muted-foreground">
            {state.meta.mode === 'real' ? '🔴 Mode Réel' : '🟡 Mode Exercice'} 
            - {state.meta.severity}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
          
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
                {isResetting ? 'Réinitialisation...' : 'Réinitialiser Session'}
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