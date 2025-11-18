import { SidebarProvider } from "@/components/ui/sidebar";
import { CrisisSidebar } from "@/components/CrisisSidebar";
import { CrisisHeader } from "@/components/CrisisHeader";
import { CrisisSession } from "@/types/crisis";

interface CrisisLayoutProps {
  session?: CrisisSession;
  onModeChange: () => void;
  onExport: () => void;
  children: React.ReactNode;
}

export function CrisisLayout({ session, onModeChange, onExport, children }: CrisisLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-card">
        <CrisisSidebar sessionMode={session?.mode} />
        <div className="flex-1 flex flex-col">
          <CrisisHeader 
            session={session} 
            onModeChange={onModeChange}
            onExport={onExport}
          />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}