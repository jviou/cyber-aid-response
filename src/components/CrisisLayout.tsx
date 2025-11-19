import { useMemo } from "react";
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
import { toast } from "sonner";
import type { CrisisSession } from "@/types/crisis";
import type { ActionItem as BoardActionItem } from "@/types/database";
import type { AppState } from "@/lib/stateStore";
import { ActionsBoard } from "@/components/ActionsBoard";
import { JournalPage } from "@/pages/JournalPage";

const severityMap: Record<
  AppState["meta"]["severity"],
  CrisisSession["severity"]
> = {
  Low: "low",
  Modérée: "moderate",
  Élevée: "high",
  Critique: "critical",
};

const toLegacyPriority = (
  priority?: "low" | "med" | "high"
): CrisisSession["actions"][number]["priority"] => {
  if (priority === "med") return "medium";
  return (priority || "medium") as CrisisSession["actions"][number]["priority"];
};

const fromLegacyPriority = (priority?: string): "low" | "med" | "high" => {
  if (!priority) return "med";
  if (priority === "medium") return "med";
  return priority as "low" | "med" | "high";
};

const buildLegacySession = (
  state: AppState,
  sessionId: string
): CrisisSession => ({
  id: sessionId,
  mode: state.meta.mode,
  title: state.meta.title,
  description: "",
  severity: severityMap[state.meta.severity] || "moderate",
  createdAt: state.meta.createdAt,
  phases: state.phases.map((phase) => ({
    id: phase.id,
    title: phase.title,
    subtitle: "",
    notes: "",
    checklist: {
      strategic: phase.strategic.map((item) => ({
        id: item.id,
        text: item.text,
        owner: item.assignee || undefined,
        dueAt: item.dueAt || undefined,
        status: item.checked ? "done" : "todo",
        evidence: [],
      })),
      operational: phase.operational.map((item) => ({
        id: item.id,
        text: item.text,
        owner: item.assignee || undefined,
        dueAt: item.dueAt || undefined,
        status: item.checked ? "done" : "todo",
        evidence: [],
      })),
    },
    injects: [],
  })),
  journal:
    state.journal?.map((event) => ({
      id: event.id,
      category: event.category,
      title: event.title,
      details: event.details,
      by: "",
      attachments: [],
      at: event.at,
    })) ?? [],
  actions:
    state.actions?.map((action) => ({
      id: action.id,
      title: action.title,
      description: action.description,
      owner: action.owner,
      priority: toLegacyPriority(action.priority),
      status: action.status,
      dueAt: action.dueAt || undefined,
      createdAt: action.createdAt,
      relatedInjectId: undefined,
    })) ?? [],
  decisions: state.decisions.map((decision) => ({
    id: decision.id,
    question: decision.title,
    optionChosen: decision.rationale,
    rationale: decision.rationale,
    validator: decision.owner,
    decidedAt: decision.decidedAt,
    impacts: [],
  })),
  communications: state.communications.map((comm) => ({
    id: comm.id,
    audience: comm.audience,
    subject: comm.subject,
    message: comm.message,
    author: "",
    approvedBy: undefined,
    sentAt: comm.sentAt,
    attachments: [],
  })),
  resources: [],
  objectives: [],
  rules: [],
  keyContacts: state.contacts.map((contact) => ({
    name: contact.name,
    role: contact.role,
    contact: contact.email || contact.phone,
  })),
});

const mapActionsToBoard = (
  actions: AppState["actions"],
  sessionId: string
): BoardActionItem[] =>
  actions.map((action) => ({
    id: action.id,
    session_id: sessionId,
    title: action.title,
    description: action.description,
    owner: action.owner || undefined,
    priority: action.priority || "med",
    status: action.status,
    due_at: action.dueAt || undefined,
    created_at: action.createdAt,
    updated_at: action.updatedAt || action.createdAt,
    client_op_id: undefined,
  }));

const mapBoardUpdatesToState = (updates: Partial<BoardActionItem>) => ({
  ...(updates.title !== undefined ? { title: updates.title } : {}),
  ...(updates.description !== undefined
    ? { description: updates.description || "" }
    : {}),
  ...(updates.owner !== undefined ? { owner: updates.owner || "" } : {}),
  ...(updates.priority ? { priority: updates.priority } : {}),
  ...(updates.status ? { status: updates.status } : {}),
  ...(updates.due_at !== undefined ? { dueAt: updates.due_at || null } : {}),
});

export function CrisisLayout() {
  const { state, sessionId, isLoading, updateState } = useCrisisState();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-card">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const legacySession = useMemo(
    () => buildLegacySession(state, sessionId),
    [state, sessionId]
  );

  const boardActions = useMemo(
    () => mapActionsToBoard(state.actions, sessionId),
    [state.actions, sessionId]
  );

  const updateLegacySession = (updater: (session: CrisisSession) => CrisisSession) => {
    updateState((currentState) => {
      const updated = updater(buildLegacySession(currentState, sessionId));

      return {
        ...currentState,
        journal:
          updated.journal?.map((event) => ({
            id: event.id,
            at: event.at,
            category:
              event.category as AppState["journal"][number]["category"],
            title: event.title,
            details: event.details || "",
          })) || currentState.journal,
        communications:
          updated.communications?.map((comm) => ({
            id: comm.id,
            audience: comm.audience,
            subject: comm.subject,
            message: comm.message,
            sentAt: comm.sentAt || new Date().toISOString(),
          })) || currentState.communications,
        actions:
          updated.actions?.map((action, index) => ({
            id: action.id,
            title: action.title,
            description: action.description || "",
            owner: action.owner || "",
            priority: fromLegacyPriority(action.priority),
            status: action.status,
            dueAt: action.dueAt || null,
            createdAt: action.createdAt || new Date().toISOString(),
            updatedAt: action.createdAt || new Date().toISOString(),
            position: index,
          })) || currentState.actions,
      };
    });
  };

  const handleCreateAction = async (
    actionData: Omit<
      BoardActionItem,
      "id" | "session_id" | "created_at" | "updated_at" | "client_op_id"
    >
  ) => {
    const now = new Date().toISOString();
    const newAction = {
      id: crypto.randomUUID(),
      title: actionData.title,
      description: actionData.description || "",
      status: actionData.status || "todo",
      owner: actionData.owner || "",
      priority: actionData.priority || "med",
      dueAt: actionData.due_at || null,
      createdAt: now,
      updatedAt: now,
      position: state.actions.length,
    };

    updateState((prevState) => ({
      ...prevState,
      actions: [...prevState.actions, newAction],
    }));

    toast.success("Action créée");
  };

  const handleUpdateAction = async (
    id: string,
    updates: Partial<BoardActionItem>
  ) => {
    const mappedUpdates = mapBoardUpdatesToState(updates);
    updateState((prevState) => ({
      ...prevState,
      actions: prevState.actions.map((action) =>
        action.id === id
          ? { ...action, ...mappedUpdates, updatedAt: new Date().toISOString() }
          : action
      ),
    }));

    toast.success("Action mise à jour");
  };

  const handleDeleteAction = async (id: string) => {
    updateState((prevState) => ({
      ...prevState,
      actions: prevState.actions.filter((action) => action.id !== id),
    }));

    toast.success("Action supprimée");
  };

  const handleCreateDecision = (decisionData: any) => {
    const newDecision = {
      id: crypto.randomUUID(),
      title: decisionData.question,
      rationale: decisionData.rationale || "",
      owner: decisionData.validator || "",
      decidedAt: new Date().toISOString(),
    };

    updateState((prevState) => ({
      ...prevState,
      decisions: [...prevState.decisions, newDecision],
    }));

    toast.success("Décision enregistrée");
  };

  const handleDeleteDecision = (id: string) => {
    updateState((prevState) => ({
      ...prevState,
      decisions: prevState.decisions.filter(
        (decision) => decision.id !== id
      ),
    }));

    toast.success("Décision supprimée");
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
                path="/journal"
                element={
                  <JournalPage
                    session={legacySession}
                    onUpdateSession={updateLegacySession}
                  />
                }
              />
              <Route
                path="/actions"
                element={
                  <ActionsBoard
                    actions={boardActions}
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
                    session={legacySession}
                    onUpdateSession={updateLegacySession}
                  />
                }
              />
              <Route
                path="/phases/:phaseId"
                element={<PhaseManagement sessionId={sessionId} />}
              />
              <Route
                path="/decisions"
                element={
                  <DecisionsPage
                    decisions={state.decisions.map((decision) => ({
                      id: decision.id,
                      question: decision.title,
                      optionChosen: decision.rationale,
                      rationale: decision.rationale,
                      validator: decision.owner,
                      decidedAt: decision.decidedAt,
                      impacts: [],
                    }))}
                    onCreateDecision={handleCreateDecision}
                    onDeleteDecision={handleDeleteDecision}
                  />
                }
              />
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
