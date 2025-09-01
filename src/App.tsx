import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ModeSelector } from "@/components/ModeSelector";
import { AuthModal } from "@/components/AuthModal";
import { SessionPage } from "@/pages/SessionPage";
import NotFound from "./pages/NotFound";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading: authLoading } = useAuth();
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleModeSelect = async (mode: "exercise" | "real", title: string, description: string, severity: "low" | "moderate" | "high" | "critical") => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Create session in Supabase and redirect
    try {
      const { data: sessionData, error } = await supabase.from('sessions').insert({
        title,
        description,
        mode,
        severity,
        created_by: user.id
      }).select().single();
      
      if (error) throw error;
      
      // Join as participant
      await supabase.from('participants').insert({
        session_id: sessionData.id,
        user_id: user.id,
        display_name: user.user_metadata?.display_name || user.email || 'Utilisateur',
        role: 'Créateur'
      });
      
      window.location.href = `/s/${sessionData.id}`;
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowModeSelector(true);
  };

  if (authLoading) {
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
          <Routes>
            <Route 
              path="/" 
              element={
                <ModeSelector 
                  isOpen={true}
                  onModeSelect={handleModeSelect}
                />
              } 
            />
            <Route 
              path="/s/:sessionId/*" 
              element={<SessionPage />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;