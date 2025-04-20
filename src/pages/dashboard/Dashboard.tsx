
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardAdminNotice } from "./components/DashboardAdminNotice";
import { DashboardStatsCards } from "./components/DashboardStatsCards";
import { DashboardFeatureCards } from "./components/DashboardFeatureCards";
import { DashboardCharts } from "./components/DashboardCharts";
import { DashboardCampaignTabs } from "./components/DashboardCampaignTabs";

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
        <DashboardStatsCards />
        <DashboardFeatureCards />
        <DashboardCharts />
        <DashboardCampaignTabs />
      </section>
    </Layout>
  );
}
