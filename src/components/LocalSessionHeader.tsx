import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CrisisSession } from "@/types/crisis";

interface LocalSessionHeaderProps {
  session: CrisisSession;
  onExport: () => void;
}

export function LocalSessionHeader({ session, onExport }: LocalSessionHeaderProps) {
  return (
    <header className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">{session.title}</h1>
            <p className="text-sm text-muted-foreground">{session.description}</p>
          </div>
          <Badge variant={session.mode === "real" ? "destructive" : "default"}>
            {session.mode === "real" ? "MODE RÉEL" : "EXERCICE"}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {session.severity}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>
    </header>
  );
}