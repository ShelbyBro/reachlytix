
import Layout from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardAdminNotice } from "@/components/dashboard/DashboardAdminNotice";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { FeatureCards } from "@/components/dashboard/FeatureCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { CampaignTabs } from "@/components/dashboard/CampaignTabs";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";

export default function Dashboard() {
  const { profile, role } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    const greetingText =
      hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    setGreeting(`${greetingText}, ${profile?.first_name || "there"}!`);
  }, [profile]);

  return (
    <Layout>
      <section id="client-login">
        <DashboardHeader greeting={greeting} role={role} />
        <DashboardAdminNotice role={role} />

        <DashboardErrorBoundary fallback={<LoadingState className="mb-6" />}>
          <Suspense fallback={<LoadingState className="mb-6" />}>
            <StatsCards />
          </Suspense>
        </DashboardErrorBoundary>

        <DashboardErrorBoundary fallback={<LoadingState className="mb-6" />}>
          <Suspense fallback={<LoadingState className="mb-6" />}>
            <FeatureCards />
          </Suspense>
        </DashboardErrorBoundary>

        <DashboardErrorBoundary fallback={<LoadingState className="mb-6" />}>
          <Suspense fallback={<LoadingState className="mb-6" />}>
            <DashboardCharts />
          </Suspense>
        </DashboardErrorBoundary>

        <DashboardErrorBoundary fallback={<LoadingState className="mb-6" />}>
          <Suspense fallback={<LoadingState className="mb-6" />}>
            <CampaignTabs />
          </Suspense>
        </DashboardErrorBoundary>
      </section>
    </Layout>
  );
}
