
import { Suspense } from "react";
import { CampaignTabs } from "@/components/dashboard/CampaignTabs";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";

export function DashboardCampaignTabs() {
  return (
    <DashboardErrorBoundary fallback={<LoadingState className="mb-6" />}>
      <Suspense fallback={<LoadingState className="mb-6" />}>
        <CampaignTabs />
      </Suspense>
    </DashboardErrorBoundary>
  );
}
