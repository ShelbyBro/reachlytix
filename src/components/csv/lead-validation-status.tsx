
import { AlertCircle, Check } from "lucide-react";

export function LeadValidationStatus() {
  return (
    <div className="mt-3 text-xs flex flex-wrap gap-2 text-muted-foreground">
      <div className="flex items-center">
        <AlertCircle className="h-3 w-3 mr-1" />
        <span>Only valid leads will be imported</span>
      </div>
      <div className="flex items-center">
        <Check className="h-3 w-3 mr-1 text-green-500" />
        <span>Duplicate leads will be skipped</span>
      </div>
    </div>
  );
}
