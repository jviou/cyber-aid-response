import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ModeSelector } from "@/components/ModeSelector";
import { CrisisLayout } from "@/pages/CrisisLayout";
import { Dashboard } from "@/pages/Dashboard";
import { PhaseManagement } from "@/pages/PhaseManagement";
import NotFound from "./pages/NotFound";
import { useCrisisSession } from "@/hooks/useCrisisSession";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const { 
    session, 
    isLoading, 
    createSession, 
    clearSession, 
    exportSession,
    updateSession 
  } = useCrisisSession();
  
  const [showModeSelector, setShowModeSelector] = useState(false);

  const handleModeSelect = (mode: "exercise" | "real", title: string, description: string, severity: "low" | "moderate" | "high" | "critical") => {
    createSession(mode, title, description, severity);
    setShowModeSelector(false);
  };

  const handleModeChange = () => {
    clearSession();
    setShowModeSelector(true);
  };

  const handleExport = () => {
    exportSession();
  };

  // Show mode selector if no session exists and not loading
  const shouldShowModeSelector = !isLoading && (!session || showModeSelector);

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {shouldShowModeSelector ? (
            <ModeSelector 
              isOpen={true}
              onModeSelect={handleModeSelect}
            />
          ) : (
            <CrisisLayout
              session={session}
              onModeChange={handleModeChange}
              onExport={handleExport}
            >
              <Routes>
                <Route 
                  path="/" 
                  element={
                    session ? (
                      <Dashboard session={session} onExport={handleExport} />
                    ) : (
                      <div>Loading...</div>
                    )
                  } 
                />
                <Route 
                  path="/journal" 
                  element={<div className="text-center py-8">Journal - En développement</div>} 
                />
                <Route 
                  path="/actions" 
                  element={<div className="text-center py-8">Actions - En développement</div>} 
                />
                <Route 
                  path="/decisions" 
                  element={<div className="text-center py-8">Décisions - En développement</div>} 
                />
                <Route 
                  path="/communications" 
                  element={<div className="text-center py-8">Communications - En développement</div>} 
                />
                <Route 
                  path="/indicators" 
                  element={<div className="text-center py-8">Indicateurs - En développement</div>} 
                />
                <Route 
                  path="/resources" 
                  element={<div className="text-center py-8">Ressources - En développement</div>} 
                />
                <Route 
                  path="/phases/:phaseId" 
                  element={
                    session ? (
                      <PhaseManagement session={session} onUpdateSession={updateSession} />
                    ) : (
                      <div>Loading...</div>
                    )
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CrisisLayout>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;