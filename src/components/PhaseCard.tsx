
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Settings } from "lucide-react";

interface PhaseCardProps {
  phase: {
    id: string;
    code: string;
    title: string;
    subtitle?: string;
    order_index: number;
  };
  progress?: number;
  onSelect: () => void;
}

export function PhaseCard({ phase, progress = 0, onSelect }: PhaseCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-phase-${phase.order_index} text-white`}>
              {phase.order_index}
            </div>
            <div>
              <CardTitle className="text-lg">{phase.title}</CardTitle>
              {phase.subtitle && (
                <CardDescription>{phase.subtitle}</CardDescription>
              )}
            </div>
          </div>
          <Badge variant={progress === 100 ? "default" : "outline"}>
            {progress === 100 ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <Clock className="w-3 h-3 mr-1" />
            )}
            {progress.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Phase {phase.order_index} - {phase.code}
        </p>
      </CardContent>
    </Card>
  );
}
