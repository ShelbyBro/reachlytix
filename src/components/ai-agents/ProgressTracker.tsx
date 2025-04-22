
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, PlayCircle } from "lucide-react";

interface ProgressTrackerProps {
  currentIndex: number;
  leadList: string;
}

export function ProgressTracker({ currentIndex, leadList }: ProgressTrackerProps) {
  // Calculate total leads from comma-separated string
  const totalLeads = leadList ? leadList.split(',').filter(lead => lead.trim()).length : 0;
  const progress = totalLeads > 0 ? (currentIndex / totalLeads) * 100 : 0;
  const isCompleted = currentIndex >= totalLeads;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">
          {currentIndex} of {totalLeads} leads called
        </div>
        <Badge 
          variant={isCompleted ? "success" : "secondary"}
          className="flex items-center gap-1"
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Completed
            </>
          ) : (
            <>
              <PlayCircle className="w-3 h-3" />
              In Progress
            </>
          )}
        </Badge>
      </div>
      <Progress 
        value={progress} 
        className={isCompleted ? "bg-green-100" : ""} 
      />
    </div>
  );
}
