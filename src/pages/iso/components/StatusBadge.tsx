
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Make sure we have a valid non-empty status
  const safeStatus = status || "unassigned";
  
  const getVariant = (status: string) => {
    switch(status) {
      case 'unassigned': return "outline";
      case 'in_progress': return "secondary";
      case 'converted': return "default";
      case 'rejected': return "destructive";
      case 'closed': return "outline";
      case 'follow_up': return "warning";
      default: return "outline";
    }
  };

  const getLabel = (status: string) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
  };

  return (
    <Badge variant={getVariant(safeStatus) as any}>
      {getLabel(safeStatus)}
    </Badge>
  );
}
