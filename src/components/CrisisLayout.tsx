import React from 'react';
import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CrisisSidebar } from "@/components/CrisisSidebar";
import { SessionHeader } from "@/components/SessionHeader";
import { Dashboard } from "@/pages/Dashboard";
import { JournalPage } from "@/pages/JournalPage";
import { ActionsBoard } from "@/pages/ActionsBoard";
import { CommunicationsPage } from "@/pages/CommunicationsPage";
import { PhaseManagement } from "@/pages/PhaseManagement";
import { DecisionsPage } from "@/pages/DecisionsPage";
import { ResourcesPage } from "@/pages/ResourcesPage";
import { GlossaryPage } from "@/pages/GlossaryPage";
import NotFound from "@/pages/NotFound";
import { useCrisisState } from "@/hooks/useCrisisState";
import { toast } from 'sonner';

export function CrisisLayout() {
  const { state, sessionId, isLoading, updateState } = useCrisisState();

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

  // Convert state to legacy session format for components that expect it
  const legacySession = {
    id: sessionId,
    mode: state.meta.mode as 'real' | 'exercise',
    title: state.meta.title,
    description: '',
    severity: state.meta.severity as 'low' | 'moderate' | 'high' | 'critical',
    createdAt: state.meta.createdAt,
    phases: state.phases.map(phase => ({
      id: phase.id,
      title: phase.title,
      subtitle: '',
      notes: '',
      checklist: {
        strategic: phase.strategic.map(item => ({
          id: item.id,
          text: item.text,
          owner: item.assignee || undefined,
          dueAt: item.dueAt || undefined,
          status: item.checked ? 'done' as const : 'todo' as const,
          evidence: []
        })),
        operational: phase.operational.map(item => ({
          id: item.id,
          text: item.text,
          owner: item.assignee || undefined,
          dueAt: item.dueAt || undefined,
          status: item.checked ? 'done' as const : 'todo' as const,
          evidence: []
        }))
      },
      injects: []
    })),
    journal: state.journal.map(event => ({
      id: event.id,
      category: event.category,
      title: event.title,
      details: event.details,
      by: '',
      attachments: [],
      at: event.at
    })),
    actions: state.actions.map(action => ({
      id: action.id,
      title: action.title,
      description: action.description,
      owner: action.owner,
      priority: 'medium' as const,
      status: action.status as 'todo' | 'doing' | 'done',
      dueAt: action.dueAt,
      createdAt: action.createdAt,
      relatedInjectId: undefined
    })),
    decisions: state.decisions.map(decision => ({
      id: decision.id,
      question: decision.title,
      optionChosen: decision.rationale,
      rationale: decision.rationale,
      validator: decision.owner,
      decidedAt: decision.decidedAt,
      impacts: []
    })),
    communications: state.communications.map(comm => ({
      id: comm.id,
      audience: comm.audience,
      subject: comm.subject,
      message: comm.message,
      author: '',
      approvedBy: undefined,
      sentAt: comm.sentAt,
      attachments: []
    })),
    resources: [],
    objectives: [],
    rules: [],
    keyContacts: state.contacts.map(contact => ({
      name: contact.name,
      role: contact.role,
      contact: contact.email || contact.phone
    }))
  };

  // Legacy session updater
  const updateLegacySession = (updater: (session: any) => any) => {
    updateState(currentState => {
      const updated = updater(legacySession);
      return {
        ...currentState,
        journal: updated.journal?.map((event: any) => ({
          id: event.id,
          at: event.at,
          category: event.category,
          title: event.title,
          details: event.details || ''
        })) || currentState.journal,
        communications: updated.communications?.map((comm: any) => ({
          id: comm.id,
          audience: comm.audience,
          subject: comm.subject,
          message: comm.message,
          sentAt: comm.sentAt || new Date().toISOString()
        })) || currentState.communications
      };
    });
  };

  // Actions CRUD functions
  const handleCreateAction = async (actionData: any) => {
    const newAction = {
      id: crypto.randomUUID(),
      title: actionData.title,
      description: actionData.description || '',
      status: actionData.status || 'todo',
      owner: actionData.owner || '',
      dueAt: actionData.due_at || null,
      createdAt: new Date().toISOString(),
      position: state.actions.length
    };

    updateState(prevState => ({
      ...prevState,
      actions: [...prevState.actions, newAction]
    }));
    
    toast.success('Action créée');
  };

  const handleUpdateAction = async (id: string, updates: any) => {
    updateState(prevState => ({
      ...prevState,
      actions: prevState.actions.map(action =>
        action.id === id ? { ...action, ...updates } : action
      )
    }));
    
    toast.success('Action mise à jour');
  };

  const handleDeleteAction = async (id: string) => {
    updateState(prevState => ({
      ...prevState,
      actions: prevState.actions.filter(action => action.id !== id)
    }));
    
    toast.success('Action supprimée');
  };

  // Decisions CRUD functions
  const handleCreateDecision = (decisionData: any) => {
    const newDecision = {
      id: crypto.randomUUID(),
      title: decisionData.question,
      rationale: decisionData.rationale || '',
      owner: decisionData.validator || '',
      decidedAt: new Date().toISOString()
    };

    updateState(prevState => ({
      ...prevState,
      decisions: [...prevState.decisions, newDecision]
    }));
    
    toast.success('Décision enregistrée');
  };

  const handleDeleteDecision = (id: string) => {
    updateState(prevState => ({
      ...prevState,
      decisions: prevState.decisions.filter(decision => decision.id !== id)
    }));
    
    toast.success('Décision supprimée');
  };

  // Resources CRUD functions  
  const handleCreateResource = (resourceData: any) => {
    toast.success('Ressource ajoutée');
  };

  const handleDeleteResource = (id: string) => {
    toast.success('Ressource supprimée');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-card">
        <CrisisSidebar sessionMode={state.meta.mode} />
        <div className="flex-1 flex flex-col">
          <SessionHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/communications" element={
                <CommunicationsPage 
                  session={legacySession} 
                  onUpdateSession={updateLegacySession}
                />
              } />
              <Route path="/phases/:phaseId" element={
                <PhaseManagement sessionId={sessionId} />
              } />
              <Route path="/rida" element={
                <DecisionsPage 
                  decisions={state.decisions.map(decision => ({
                    id: decision.id,
                    question: decision.title,
                    optionChosen: decision.rationale,
                    rationale: decision.rationale,
                    validator: decision.owner,
                    decidedAt: decision.decidedAt,
                    impacts: []
                  }))}
                  onCreateDecision={handleCreateDecision}
                  onDeleteDecision={handleDeleteDecision}
                />
              } />
              <Route path="/resources" element={
                <ResourcesPage 
                  sessionId={sessionId}
                />
              } />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}