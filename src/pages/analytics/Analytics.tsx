
import { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { BarChart, LineChart, PieChart } from "@/components/analytics/ChartComponents";
import { supabase } from "@/integrations/supabase/client";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30days");
  
  // Fetch lead statistics
  const { data: leadStats, isLoading: loadingLeadStats } = useQuery({
    queryKey: ['lead-stats', timeRange],
    queryFn: async () => {
      // In a real application, this would fetch actual data from the database
      // For now, return mock data for demonstration
      return {
        totalLeads: 1245,
        newLeads: 87,
        conversionRate: 4.2,
        avgResponseTime: "3.2",
        leadsBySource: [
          { name: "Website", value: 45 },
          { name: "Referral", value: 25 },
          { name: "Social Media", value: 15 },
          { name: "Ads", value: 15 }
        ],
        leadsByStatus: [
          { name: "New", value: 35 },
          { name: "Contacted", value: 25 },
          { name: "Qualified", value: 20 },
          { name: "Proposal", value: 15 },
          { name: "Converted", value: 5 }
        ],
        leadTrend: [
          { name: "Jan", count: 65 },
          { name: "Feb", count: 75 },
          { name: "Mar", count: 85 },
          { name: "Apr", count: 80 },
          { name: "May", count: 90 },
          { name: "Jun", count: 95 },
          { name: "Jul", count: 100 },
          { name: "Aug", count: 110 },
          { name: "Sep", count: 120 },
          { name: "Oct", count: 130 },
          { name: "Nov", count: 125 },
          { name: "Dec", count: 135 }
        ]
      };
    }
  });
  
  // Fetch campaign statistics
  const { data: campaignStats, isLoading: loadingCampaignStats } = useQuery({
    queryKey: ['campaign-stats', timeRange],
    queryFn: async () => {
      // In a real application, this would fetch actual data
      return {
        totalCampaigns: 24,
        activeCampaigns: 3,
        completedCampaigns: 21,
        totalMessages: 15487,
        openRate: 22.4,
        clickRate: 3.8,
        responseRate: 1.2,
        campaignPerformance: [
          { name: "Campaign A", sent: 1200, opened: 400, clicked: 120, replied: 45 },
          { name: "Campaign B", sent: 950, opened: 380, clicked: 95, replied: 40 },
          { name: "Campaign C", sent: 1500, opened: 600, clicked: 180, replied: 75 },
          { name: "Campaign D", sent: 800, opened: 320, clicked: 96, replied: 30 }
        ]
      };
    }
  });
  
  // Fetch agent statistics
  const { data: agentStats, isLoading: loadingAgentStats } = useQuery({
    queryKey: ['agent-stats', timeRange],
    queryFn: async () => {
      // In a real application, this would fetch actual data
      return {
        totalAgents: 8,
        activeAgents: 5,
        totalCalls: 723,
        avgCallDuration: "4:12",
        callsConnected: 548,
        callsAnswered: 312,
        agentPerformance: [
          { name: "Agent 1", calls: 120, connected: 95, converted: 15 },
          { name: "Agent 2", calls: 150, connected: 125, converted: 20 },
          { name: "Agent 3", calls: 110, connected: 90, converted: 12 },
          { name: "Agent 4", calls: 180, connected: 140, converted: 25 },
          { name: "Agent 5", calls: 163, connected: 98, converted: 18 }
        ],
        callsTimeline: [
          { name: "Week 1", calls: 150 },
          { name: "Week 2", calls: 165 },
          { name: "Week 3", calls: 180 },
          { name: "Week 4", calls: 228 }
        ]
      };
    }
  });

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track your marketing and outreach performance
            </p>
          </div>
          <div className="min-w-[180px]">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">Past year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="lead" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="lead">Lead Analytics</TabsTrigger>
            <TabsTrigger value="campaign">Campaign Analytics</TabsTrigger>
            <TabsTrigger value="agent">Agent Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lead" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadStats?.totalLeads}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadStats?.newLeads}</div>
                  <p className="text-xs text-green-500 mt-1">+4.5% from last period</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadStats?.conversionRate}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadStats?.avgResponseTime} hrs</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leads by Source</CardTitle>
                  <CardDescription>Where your leads are coming from</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {leadStats?.leadsBySource && <PieChart data={leadStats.leadsBySource} />}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Leads by Status</CardTitle>
                  <CardDescription>Current pipeline distribution</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {leadStats?.leadsByStatus && <PieChart data={leadStats.leadsByStatus} />}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Lead Acquisition Trend</CardTitle>
                <CardDescription>Monthly lead generation over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {leadStats?.leadTrend && <LineChart data={leadStats.leadTrend} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="campaign" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaignStats?.totalCampaigns}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaignStats?.totalMessages}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaignStats?.openRate}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaignStats?.clickRate}%</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Performance metrics for recent campaigns</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {campaignStats?.campaignPerformance && <BarChart data={campaignStats.campaignPerformance} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="agent" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agentStats?.activeAgents} / {agentStats?.totalAgents}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agentStats?.totalCalls}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Connected Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {agentStats && ((agentStats.callsConnected / agentStats.totalCalls) * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Call Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agentStats?.avgCallDuration}</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Performance</CardTitle>
                  <CardDescription>Call metrics by agent</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {agentStats?.agentPerformance && <BarChart data={agentStats.agentPerformance} />}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Call Volume Trend</CardTitle>
                  <CardDescription>Call activity over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {agentStats?.callsTimeline && <LineChart data={agentStats.callsTimeline} />}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
