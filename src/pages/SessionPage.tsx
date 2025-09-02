
import { useParams, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeSession } from "@/hooks/useRealtimeSession";
import { usePhases } from "@/hooks/usePhases";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/AuthModal";
import { SessionHeader } from "@/components/SessionHeader";
import { CrisisSidebar } from "@/components/CrisisSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Dashboard } from "./Dashboard";
import { JournalPage } from "./JournalPage";
import { ActionsBoard } from "./ActionsBoard";
import { CommunicationsPage } from "./CommunicationsPage";
import { PhaseManagement } from "./PhaseManagement";
import { PhasesPage } from "./PhasesPage";
import NotFound from "./NotFound";

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userJoined, setUserJoined] = useState(false);

  const {
    session,
    participants,
    journalEvents,
    actions,
    decisions,
    communications,
    resources,
    loading: sessionLoading,
    joinSession,
    createAction,
    updateAction,
    createJournalEvent,
    refetch
  } = useRealtimeSession(sessionId!);

  const { phases, loading: phasesLoading } = usePhases(sessionId!);

  // Check if user has joined the session
  useEffect(() => {
    if (user && participants.length > 0) {
      const userParticipant = participants.find(p => p.user_id === user.id);
      setUserJoined(!!userParticipant);
    }
  }, [user, participants]);

  // Show auth modal if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [authLoading, user]);

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    if (user) {
      const displayName = user.user_metadata?.display_name || user.email || 'Utilisateur';
      await joinSession(displayName, 'Participant');
      setUserJoined(true);
    }
  };

  if (authLoading || sessionLoading || phasesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-card">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-card">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session introuvable</h2>
          <p className="text-muted-foreground">Cette session n'existe pas ou vous n'y avez pas accès.</p>
        </div>
      </div>
    );
  }

  if (!user || !userJoined) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gradient-card">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Rejoindre la session</h2>
            <p className="text-muted-foreground mb-4">{session.title}</p>
            <p className="text-sm text-muted-foreground">Connectez-vous pour participer à cette session de crise.</p>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Mock legacy session object for compatibility with existing components
  const legacySession = {
    id: session.id,
    mode: session.mode as any,
    title: session.title,
    description: session.description || '',
    severity: session.severity as any,
    createdAt: session.created_at,
    phases: [], // Will be replaced by real phases when components are updated
    journal: journalEvents.map(event => ({
      ...event,
      category: event.category as any,
      attachments: event.attachments || []
    })),
    actions: actions.map(action => ({
      ...action,
      priority: action.priority as any,
      status: action.status as any,
      dueAt: action.due_at,
      createdAt: action.created_at
    })),
    decisions: decisions.map(decision => ({
      ...decision,
      optionChosen: decision.option_chosen,
      decidedAt: decision.decided_at,
      impacts: decision.tags || []
    })),
    communications: communications.map(comm => ({
      ...comm,
      sentAt: comm.sent_at,
      attachments: comm.attachments || []
    })),
    resources: resources.map(resource => ({
      ...resource,
      url: resource.url,
      note: resource.note,
      tags: resource.tags || []
    })),
    keyContacts: []
  };

  // Handle create action with Supabase
  const handleCreateAction = async (actionData: any) => {
    await createAction(actionData);
  };

  // Handle update action with Supabase
  const handleUpdateAction = async (id: string, updates: any) => {
    return updateAction(id, updates);
  };

  // Handle delete action with Supabase
  const handleDeleteAction = async (id: string) => {
    const { error } = await supabase
      .from('actions')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    
    refetch();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-card">
        <CrisisSidebar sessionMode={session.mode} />
        <div className="flex-1 flex flex-col">
          <SessionHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route 
                path="dashboard" 
                element={<Dashboard />} 
              />
              <Route 
                path="journal" 
                element={
                  <JournalPage 
                    session={legacySession} 
                    onUpdateSession={() => {}} 
                  />
                }
              />
              <Route 
                path="actions" 
                element={
                  <ActionsBoard 
                    actions={actions}
                    onCreateAction={handleCreateAction}
                    onUpdateAction={handleUpdateAction}
                    onDeleteAction={handleDeleteAction}
                  />
                }
              />
              <Route 
                path="communications" 
                element={
                  <CommunicationsPage 
                    session={legacySession} 
                    onUpdateSession={() => {}} 
                  />
                }
              />
              <Route 
                path="phases" 
                element={
                  <PhasesPage 
                    sessionId={sessionId!}
                    phases={phases}
                  />
                } 
              />
              <Route 
                path="phases/:phaseId" 
                element={
                  <PhaseManagement 
                    sessionId={sessionId} 
                  />
                } 
              />
              <Route 
                path="decisions" 
                element={<div className="text-center py-8">Décisions - En développement</div>} 
              />
              <Route 
                path="indicators" 
                element={<div className="text-center py-8">Indicateurs - En développement</div>} 
              />
              <Route 
                path="resources" 
                element={<div className="text-center py-8">Ressources - En développement</div>} 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
