import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export function NetworkStatus() {
  const isOnline = useNetworkStatus();
  const { pendingOps, issyncing, syncPendingOperations } = useOfflineSync();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOnline ? "default" : "destructive"} className="gap-1">
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isOnline ? "En ligne" : "Hors ligne"}
      </Badge>
      
      {pendingOps.length > 0 && (
        <Badge variant="outline" className="gap-1">
          {pendingOps.length} en attente
          {isOnline && (
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0 ml-1"
              onClick={syncPendingOperations}
              disabled={issyncing}
            >
              <RefreshCw className={`h-3 w-3 ${issyncing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </Badge>
      )}
    </div>
  );
}