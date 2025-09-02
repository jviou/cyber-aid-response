import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ModeSelector } from "@/components/ModeSelector";
import { LocalCrisisLayout } from "@/components/LocalCrisisLayout";
import { useCrisisSession } from "@/hooks/useCrisisSession";
import { Button } from "@/components/ui/button";
import { RotateCcw, Upload, Download } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

const App = () => {
  const {
    session,
    isLoading,
    createSession,
    clearSession,
    exportSession,
    loadSession
  } = useCrisisSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeSelect = (
    mode: "exercise" | "real",
    title: string,
    description: string,
    severity: "low" | "moderate" | "high" | "critical"
  ) => {
    createSession(mode, title, description, severity);
  };

  const handleReset = () => {
    if (confirm("Êtes-vous sûr de vouloir reset la session ? Toutes les données seront perdues.")) {
      clearSession();
      toast.success("Session réinitialisée");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadSession(file);
      toast.success("Session importée avec succès");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-card">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Show mode selector if no session
  if (!session) {
    return (
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-gradient-card">
          <ModeSelector 
            isOpen={true}
            onModeSelect={handleModeSelect}
          />
          <div className="fixed top-4 right-4 flex gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen">
          {/* Session Controls */}
          <div className="fixed top-4 right-4 z-50 flex gap-2">
            <Button variant="outline" onClick={exportSession}>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/*" element={<LocalCrisisLayout session={session} onExport={exportSession} />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;