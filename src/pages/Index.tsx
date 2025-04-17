
import { useEffect, useState } from "react";
import { ArrowUpRight, Upload, Users, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { CSVUploader } from "@/components/csv-uploader";
import { NeuralBackground } from "@/components/neural-background";
import { MarketingAutomationSection } from "@/components/automation/MarketingAutomationSection";

export default function Dashboard() {
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [campaignsCount, setCampaignsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch leads count
        const { count: leadsCount, error: leadsError } = await supabase
          .from("leads")
          .select("*", { count: 'exact', head: true });
        
        if (leadsError) throw leadsError;
        
        // Fetch campaigns count
        const { count: campaignsCount, error: campaignsError } = await supabase
          .from("campaigns")
          .select("*", { count: 'exact', head: true });
        
        if (campaignsError) throw campaignsError;
        
        setLeadsCount(leadsCount || 0);
        setCampaignsCount(campaignsCount || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      {/* 👇 Wrapping dashboard with scroll ID */}
      <section id="client-login">
        <div className="relative">
          <NeuralBackground />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome to your Reachlytix dashboard
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {/* Card 1: Total Leads */}
              <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Total Leads</CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isLoading ? "..." : leadsCount}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    View all leads <ArrowUpRight className="h-3 w-3 ml-1" />
                  </p>
                </CardContent>
              </Card>

              {/* Card 2: Total Campaigns */}
              <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Total Campaigns</CardTitle>
                  <Megaphone className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isLoading ? "..." : campaignsCount}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    View all campaigns <ArrowUpRight className="h-3 w-3 ml-1" />
                  </p>
                </CardContent>
              </Card>

              {/* Card 3: Quick Actions */}
              <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                  <Upload className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="justify-start">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Leads
                    </Button>
                    <Button size="sm" variant="outline" className="justify-start">
                      <Megaphone className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Marketing Automation Section */}
            <div className="mb-8">
              <MarketingAutomationSection />
            </div>

            {/* CSV Upload Form with improved UI */}
            <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CSVUploader />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
