
import { Suspense } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";

export function DashboardStatsCards() {
  return (
    <DashboardErrorBoundary fallback={<LoadingState className="mb-6" />}>
      <Suspense fallback={<LoadingState className="mb-6" />}>
        <StatsCards />
      </Suspense>
    </DashboardErrorBoundary>
  );
}
