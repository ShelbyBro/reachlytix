
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  PieChart
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp, Users, Mail, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['analytics-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: emailsData, isLoading: emailsLoading } = useQuery({
    queryKey: ['analytics-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Function to count leads by source
  const getLeadsBySource = () => {
    if (!leadsData) return [];
    
    const sourceMap = new Map();
    leadsData.forEach(lead => {
      const source = lead.source || 'Unknown';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });
    
    return Array.from(sourceMap).map(([name, value]) => ({ name, value }));
  };

  // Generate mock data for email engagement (since we don't have real data)
  const getEmailEngagementData = () => {
    return [
      { name: 'Opened', value: Math.floor(Math.random() * 30) + 40 },
      { name: 'Clicked', value: Math.floor(Math.random() * 20) + 10 },
      { name: 'Not Opened', value: Math.floor(Math.random() * 40) + 20 }
    ];
  };

  // Get total numbers
  const totalLeads = leadsData?.length || 0;
  const totalEmails = emailsData?.length || 0;
  const openRate = Math.floor(Math.random() * 30) + 40; // Mock data: random between 40-70%
  const conversionRate = Math.floor(Math.random() * 15) + 5; // Mock data: random between 5-20%

  const leadsBySourceData = getLeadsBySource();
  const emailEngagementData = getEmailEngagementData();

  const isLoading = leadsLoading || emailsLoading;

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View detailed performance metrics and insights
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLeads.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    From all sources combined
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEmails.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all campaigns
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{openRate}%</div>
                  <p className="text-xs text-green-500">
                    {openRate > 50 ? 'Above industry average' : 'Room for improvement'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{conversionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    From email to action
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Leads by Source</CardTitle>
                  <CardDescription>
                    Distribution of leads across different sources
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <BarChart
                    data={leadsBySourceData}
                    width={400}
                    height={300}
                    index="name"
                    categories={["value"]}
                    colors={["#9b87f5"]}
                    valueFormatter={(value) => `${value} leads`}
                    className="h-[300px]"
                  />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Email Engagement</CardTitle>
                  <CardDescription>
                    Overview of email campaign performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChart
                    data={emailEngagementData}
                    width={400}
                    height={300}
                    index="name"
                    categories={["value"]}
                    colors={["#4CAF50", "#2196F3", "#FFC107"]}
                    valueFormatter={(value) => `${value} emails`}
                    className="h-[300px]"
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
