
import { Suspense } from "react";
import { FeatureCards } from "@/components/dashboard/FeatureCards";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";

export function DashboardFeatureCards() {
  return (
    <DashboardErrorBoundary fallback={<LoadingState className="mb-6" />}>
      <Suspense fallback={<LoadingState className="mb-6" />}>
        <FeatureCards />
      </Suspense>
    </DashboardErrorBoundary>
  );
}
