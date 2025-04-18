
import { useEffect } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp, Users, Mail, Activity, BarChart as BarChartIcon } from "lucide-react";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { AreaChartComponent, BarChartComponent, PieChartComponent } from "@/components/analytics/ChartComponents";
import { useUserRole } from "@/hooks/use-user-role";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmailAnalytics } from "@/components/analytics/EmailAnalytics";

export default function AnalyticsPage() {
  const { analyticsData, isLoading } = useAnalyticsData();
  const { role, roleReady } = useUserRole();
  
  // Early return for loading state
  if (isLoading || !roleReady) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            {role && (
              <Badge variant="outline" className="text-sm">
                {role === "admin" ? "Admin View (All Data)" : "Client View (Your Data Only)"}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            Performance metrics and campaign insights
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="email">Email Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalLeads.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    From all sources combined
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <BarChartIcon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.activeCampaigns.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently running campaigns
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                  <Mail className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.sentEmails.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total emails delivered
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  <Activity className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalClicks.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Click-through engagement
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different chart views */}
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="performance">Campaign Performance</TabsTrigger>
                <TabsTrigger value="sources">Lead Sources</TabsTrigger>
                <TabsTrigger value="status">Lead Status</TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Performance Over Time</CardTitle>
                    <CardDescription>
                      Email sends by day over the past two weeks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px] pt-2">
                    <AreaChartComponent data={analyticsData.campaignPerformance} height={300} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="sources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Leads by Source</CardTitle>
                    <CardDescription>
                      Distribution of leads across different acquisition channels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px] pt-2">
                    <BarChartComponent data={analyticsData.leadsBySource} height={300} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="status" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Leads by Status</CardTitle>
                    <CardDescription>
                      Current status distribution of all leads
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px] pt-2">
                    <PieChartComponent data={analyticsData.leadsByStatus} height={300} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Data source notice */}
            <Alert className="bg-muted/50">
              <AlertTitle>About this data</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                {analyticsData.totalLeads < 10 ? (
                  <>Some visualizations may include mock data where real data is limited. As you add more leads and campaigns, charts will automatically update with real metrics.</>
                ) : (
                  <>Analytics are updated every 5 minutes. Last updated: {new Date().toLocaleTimeString()}</>
                )}
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="email">
            <EmailAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
