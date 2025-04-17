
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
            <Lock className="h-3.5 w-3.5 absolute -top-1 -right-1 text-muted-foreground bg-background rounded-full p-0.5" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-black/80 text-white border-none px-3 py-2">
          <p className="text-sm">Only available in the full version after login.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
