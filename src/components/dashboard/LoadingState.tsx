
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="h-32 w-full mb-4" />
      <Skeleton className="h-8 w-2/3 mb-2" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  );
}
