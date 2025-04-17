
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock } from "lucide-react";

interface DemoFeatureTooltipProps {
  children: React.ReactNode;
}

export function DemoFeatureTooltip({ children }: DemoFeatureTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="relative inline-flex">
            {children}
            <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">This feature is only available in the full version after login.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
