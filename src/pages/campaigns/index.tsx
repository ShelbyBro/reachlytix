
import React, { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { NeuralBackground } from "@/components/neural-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ArrowUpRight, Calendar, Users, Megaphone } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  status: string;
  scheduled_at: string;
  created_at: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("campaigns")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCampaigns(data || []);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCampaigns();
  }, []);

  // Group campaigns by status
  const activeCampaigns = campaigns.filter(c => c.status === "active");
  const scheduledCampaigns = campaigns.filter(c => c.status === "scheduled");
  const completedCampaigns = campaigns.filter(c => c.status === "completed");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-500 bg-green-500/10";
      case "scheduled": return "text-blue-500 bg-blue-500/10";
      case "completed": return "text-gray-500 bg-gray-500/10";
      default: return "text-muted-foreground bg-muted/50";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="relative">
        <NeuralBackground />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Campaigns
              </h1>
              <p className="text-muted-foreground">
                Manage your marketing campaigns
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
                  <CardHeader className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent className="animate-pulse">
                    <div className="h-24 bg-muted/50 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
              <CardContent className="p-8 text-center">
                <Megaphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first marketing campaign to engage with your leads
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">Active Campaigns</CardTitle>
                    <Megaphone className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{activeCampaigns.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Currently running
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">Scheduled</CardTitle>
                    <Calendar className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{scheduledCampaigns.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upcoming campaigns
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">Reach</CardTitle>
                    <Users className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">--</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total leads targeted
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>All Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{campaign.title || "Unnamed Campaign"}</p>
                          <p className="text-xs text-muted-foreground">
                            {campaign.scheduled_at 
                              ? `Scheduled: ${formatDate(campaign.scheduled_at)}` 
                              : `Created: ${formatDate(campaign.created_at)}`}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span 
                            className={`text-xs py-1 px-2 rounded-full mr-2 ${getStatusColor(campaign.status)}`}
                          >
                            {campaign.status || "Draft"}
                          </span>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
