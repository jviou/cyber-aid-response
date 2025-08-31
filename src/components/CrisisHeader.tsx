import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  RotateCcw, 
  Download, 
  Clock, 
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { CrisisSession, Severity } from "@/types/crisis";

interface CrisisHeaderProps {
  session?: CrisisSession;
  onModeChange: () => void;
  onExport: () => void;
}

export function CrisisHeader({ session, onModeChange, onExport }: CrisisHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      if (session) {
        const startTime = new Date(session.createdAt);
        setSessionDuration(Math.floor((now.getTime() - startTime.getTime()) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  const getSeverityBadge = (severity: Severity) => {
    const variants = {
      low: { variant: "secondary" as const, label: "FAIBLE" },
      moderate: { variant: "default" as const, label: "MODÉRÉE" },
      high: { variant: "destructive" as const, label: "ÉLEVÉE" },
      critical: { variant: "destructive" as const, label: "CRITIQUE", className: "bg-critical text-critical-foreground" }
    };
    return variants[severity];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <header className="h-16 bg-gradient-header shadow-header flex items-center px-6 border-b">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:bg-white/20" />
          <h1 className="text-xl font-bold text-white">Crisis Manager</h1>
        </div>
      </header>
    );
  }

  const severityConfig = getSeverityBadge(session.severity);

  return (
    <header className="h-16 bg-gradient-header shadow-header flex items-center justify-between px-6 border-b">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-white hover:bg-white/20" />
        
        <div className="flex items-center gap-3">
          {session.mode === "exercise" ? (
            <BookOpen className="w-5 h-5 text-white" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-white" />
          )}
          
          <div>
            <h1 className="text-lg font-bold text-white truncate max-w-64">
              {session.title}
            </h1>
            <div className="flex items-center gap-2">
              <Badge 
                variant={session.mode === "real" ? "secondary" : "default"}
                className="text-xs bg-white/20 text-white border-white/30"
              >
                {session.mode === "real" ? "RÉEL" : "EXERCICE"}
              </Badge>
              <Badge 
                variant={severityConfig.variant}
                className={`text-xs ${'className' in severityConfig ? severityConfig.className : ""}`}
              >
                {severityConfig.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Timer */}
        <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-1 rounded-lg">
          <Clock className="w-4 h-4" />
          <div className="text-sm">
            <div className="font-mono">{currentTime.toLocaleTimeString('fr-FR')}</div>
            {session.mode === "exercise" && (
              <div className="text-xs opacity-75">
                Durée: {formatDuration(sessionDuration)}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onModeChange}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Changer de mode
          </Button>
        </div>
      </div>
    </header>
  );
}