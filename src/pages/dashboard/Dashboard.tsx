
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { FeatureCards } from "@/components/dashboard/FeatureCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { CampaignTabs } from "@/components/dashboard/CampaignTabs";

export default function Dashboard() {
  const { profile, role } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    setGreeting(`${greeting}, ${profile?.first_name || 'there'}!`);
  }, [profile]);

  return (
    <Layout>
      <section id="client-login">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              {greeting} {role && <span className="inline-flex items-center ml-2 px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary"><Shield size={12} className="mr-1" /> {role.charAt(0).toUpperCase() + role.slice(1)}</span>}
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">Export</Button>
            <Button>New Campaign</Button>
          </div>
        </div>

        {role === "admin" && (
          <div className="bg-primary/10 rounded-lg p-4 mb-6">
            <h2 className="font-medium flex items-center">
              <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              You have administrator privileges. You can manage all clients, campaigns, and users.
            </p>
          </div>
        )}

        <StatsCards />
        <FeatureCards />
        <DashboardCharts />
        <CampaignTabs />
      </section>
    </Layout>
  );
}
