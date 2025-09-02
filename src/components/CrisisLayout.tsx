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
import NotFound from "@/pages/NotFound";
import { useCrisisState } from "@/hooks/useCrisisState";

export function CrisisLayout() {
  const { state, isLoading } = useCrisisState();

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-card">
        <CrisisSidebar sessionMode={state.meta.mode} />
        <div className="flex-1 flex flex-col">
          <SessionHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/actions" element={<ActionsBoard />} />
              <Route path="/communications" element={<CommunicationsPage />} />
              <Route path="/phases/:phaseId" element={<PhaseManagement />} />
              <Route path="/decisions" element={<DecisionsPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}