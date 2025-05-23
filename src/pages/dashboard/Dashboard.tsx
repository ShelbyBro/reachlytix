
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardAdminNotice } from "./components/DashboardAdminNotice";
import { DashboardStatsCards } from "./components/DashboardStatsCards";
import { DashboardFeatureCards } from "./components/DashboardFeatureCards";
import { DashboardCharts } from "./components/DashboardCharts";
import { DashboardCampaignTabs } from "./components/DashboardCampaignTabs";
import { IsoApplicationsWidget } from "./components/IsoApplicationsWidget";

export default function Dashboard() {
  const { profile, role } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    const greetingText =
      hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    setGreeting(`${greetingText}, ${profile?.first_name || "there"}!`);
  }, [profile]);

  const isIso = role === "iso";

  return (
    <Layout>
      <section id="client-login">
        <DashboardHeader greeting={greeting} role={role} />
        <DashboardAdminNotice role={role} />
        {isIso && (
          <div className="mb-4">
            <IsoApplicationsWidget />
          </div>
        )}
        <DashboardStatsCards />
        <DashboardFeatureCards />
        <DashboardCharts />
        <DashboardCampaignTabs />
      </section>
    </Layout>
  );
}

