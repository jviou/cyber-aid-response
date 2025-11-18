import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CrisisSidebar } from "@/components/CrisisSidebar";
import { LocalSessionHeader } from "@/components/LocalSessionHeader";
import { Dashboard } from "@/pages/Dashboard";
import { JournalPage } from "@/pages/JournalPage";
import { LocalActionsBoard } from "@/components/LocalActionsBoard";
import { CommunicationsPage } from "@/pages/CommunicationsPage";
import { PhaseManagement } from "@/pages/PhaseManagement";
import { DecisionsPage } from "@/pages/DecisionsPage";
import { ResourcesPage } from "@/pages/ResourcesPage";
import NotFound from "@/pages/NotFound";
import { CrisisSession, ActionItem, Decision, Resource } from "@/types/crisis";
import { useCrisisSession } from "@/hooks/useCrisisSession";

interface LocalCrisisLayoutProps {
  session: CrisisSession;
  onExport: () => void;
}

export function LocalCrisisLayout({ session, onExport }: LocalCrisisLayoutProps) {
  const { updateSession } = useCrisisSession();

  // Action handlers
  const handleCreateAction = (actionData: Omit<ActionItem, 'id' | 'createdAt'>) => {
    const newAction: ActionItem = {
      ...actionData,
      id: `action-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    updateSession(session => ({
      ...session,
      actions: [...session.actions, newAction]
    }));
  };

  const handleUpdateAction = (id: string, updates: Partial<ActionItem>) => {
    updateSession(session => ({
      ...session,
      actions: session.actions.map(action => 
        action.id === id ? { ...action, ...updates } : action
      )
    }));
  };

  const handleDeleteAction = (id: string) => {
    updateSession(session => ({
      ...session,
      actions: session.actions.filter(action => action.id !== id)
    }));
  };

  // Decision handlers
  const handleCreateDecision = (decisionData: Omit<Decision, 'id' | 'decidedAt'>) => {
    const newDecision: Decision = {
      ...decisionData,
      id: `decision-${Date.now()}`,
      decidedAt: new Date().toISOString()
    };

    updateSession(session => ({
      ...session,
      decisions: [...session.decisions, newDecision]
    }));
  };

  const handleDeleteDecision = (id: string) => {
    updateSession(session => ({
      ...session,
      decisions: session.decisions.filter(decision => decision.id !== id)
    }));
  };

  // Resource handlers
  const handleCreateResource = (resourceData: Omit<Resource, 'id'>) => {
    const newResource: Resource = {
      ...resourceData,
      id: `resource-${Date.now()}`
    };

    updateSession(session => ({
      ...session,
      resources: [...session.resources, newResource]
    }));
  };

  const handleDeleteResource = (id: string) => {
    updateSession(session => ({
      ...session,
      resources: session.resources.filter(resource => resource.id !== id)
    }));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-card">
        <CrisisSidebar sessionMode={session?.mode} />
        <div className="flex-1 flex flex-col">
          <LocalSessionHeader 
            session={session}
            onExport={onExport}
          />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route 
                path="/dashboard" 
                element={<Dashboard />} 
              />
              <Route 
                path="/journal" 
                element={
                  <JournalPage 
                    session={session}
                    onUpdateSession={updateSession}
                  />
                } 
              />
              <Route 
                path="/actions" 
                element={
                  <LocalActionsBoard 
                    actions={session.actions}
                    onCreateAction={handleCreateAction}
                    onUpdateAction={handleUpdateAction}
                    onDeleteAction={handleDeleteAction}
                  />
                } 
              />
              <Route 
                path="/communications" 
                element={
                  <CommunicationsPage 
                    session={session}
                    onUpdateSession={updateSession}
                  />
                } 
              />
              <Route 
                path="/phases/:phaseId" 
                element={<PhaseManagement sessionId={session.id} />} 
              />
              <Route 
                path="/decisions" 
                element={
                  <DecisionsPage 
                    decisions={session.decisions}
                    onCreateDecision={handleCreateDecision}
                    onDeleteDecision={handleDeleteDecision}
                  />
                } 
              />
              <Route 
                path="/resources" 
                element={
                  <ResourcesPage 
                    sessionId={session.id}
                  />
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}