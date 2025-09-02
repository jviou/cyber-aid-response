import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NetworkStatus } from "./NetworkStatus";
import { Share2, Users, Settings } from "lucide-react";
import { toast } from "sonner";
import type { Session, Participant } from "@/types/database";

interface SessionHeaderProps {
  session: Session;
  participants: Participant[];
  onSettings?: () => void;
}

const SEVERITY_COLORS = {
  low: "bg-green-500",
  moderate: "bg-yellow-500", 
  high: "bg-orange-500",
  critical: "bg-red-500"
};

const SEVERITY_LABELS = {
  low: "Faible",
  moderate: "Modéré",
  high: "Élevé", 
  critical: "Critique"
};

export function SessionHeader({ session, participants, onSettings }: SessionHeaderProps) {
  const handleShare = () => {
    const url = `${window.location.origin}/s/${session.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien de session copié");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">{session.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge 
                variant="outline" 
                className={`${SEVERITY_COLORS[session.severity]} text-white border-transparent`}
              >
                {SEVERITY_LABELS[session.severity]}
              </Badge>
              <span>•</span>
              <span className="capitalize">{session.mode}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NetworkStatus />
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {participants.length} participant{participants.length > 1 ? 's' : ''}
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>

          {onSettings && (
            <Button variant="outline" size="sm" onClick={onSettings}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}