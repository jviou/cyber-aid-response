import { useMemo } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CrisisSidebar } from "@/components/CrisisSidebar";
import { SessionHeader } from "@/components/SessionHeader";
import { Dashboard } from "@/pages/Dashboard";
import { CommunicationsPage } from "@/pages/CommunicationsPage";
import { PhaseManagement } from "@/pages/PhaseManagement";
import { DecisionsPage } from "@/pages/DecisionsPage";
import { ResourcesPage } from "@/pages/ResourcesPage";
import { GlossaryPage } from "@/pages/GlossaryPage";
import NotFound from "@/pages/NotFound";
import { useCrisisState } from "@/hooks/useCrisisState";
import type { CrisisSession } from "@/types/crisis";
import type { AppState } from "@/lib/stateStore";

const severityMap: Record<AppState["meta"]["severity"], CrisisSession["severity"]> = {
  Low: 'low',
  'Modérée': 'moderate',
  'Élevée': 'high',
  'Critique': 'critical'
};

const buildLegacySession = (state: AppState, sessionId: string): CrisisSession => ({
  id: sessionId,
  mode: state.meta.mode,
  title: state.meta.title,
  description: '',
  severity: severityMap[state.meta.severity] || 'moderate',
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
        status: item.checked ? 'done' : 'todo',
        evidence: []
      })),
      operational: phase.operational.map(item => ({
        id: item.id,
        text: item.text,
        owner: item.assignee || undefined,
        dueAt: item.dueAt || undefined,
        status: item.checked ? 'done' : 'todo',
        evidence: []
      }))
    },
    injects: []
  })),
  journal: [],
  actions: [],
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
});

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

  const legacySession = useMemo(() => buildLegacySession(state, sessionId), [state, sessionId]);

  const updateLegacySession = (updater: (session: CrisisSession) => CrisisSession) => {
    updateState(currentState => {
      const updated = updater(buildLegacySession(currentState, sessionId));
      return {
        ...currentState,
        communications: updated.communications?.map(comm => ({
          id: comm.id,
          audience: comm.audience,
          subject: comm.subject,
          message: comm.message,
          sentAt: comm.sentAt || new Date().toISOString()
        })) || currentState.communications
      };
    });
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
              <Route
                path="/communications"
                element={<CommunicationsPage session={legacySession} onUpdateSession={updateLegacySession} />}
              />
              <Route path="/phases/:phaseId" element={<PhaseManagement sessionId={sessionId} />} />
              <Route path="/decisions" element={<DecisionsPage />} />
              <Route path="/rida" element={<Navigate to="/decisions" replace />} />
              <Route path="/resources" element={<ResourcesPage sessionId={sessionId} />} />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
