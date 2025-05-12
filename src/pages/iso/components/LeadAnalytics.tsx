
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChartComponent } from "@/components/analytics/ChartComponents";
import { StatsCard } from "./StatsCard";
import { Loader2, PieChart, TrendingDown, Trophy } from "lucide-react";

export function LeadAnalytics() {
  const [currentMonth, setCurrentMonth] = useState<string>("");
  
  useEffect(() => {
    const date = new Date();
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }, []);

  // Query for monthly leads
  const { data: monthlyLeads, isLoading: loadingMonthly } = useQuery({
    queryKey: ['iso-leads-monthly', currentMonth],
    queryFn: async () => {
      if (!currentMonth) return 0;
      
      const startOfMonth = `${currentMonth}-01`;
      const date = new Date(startOfMonth);
      const nextMonth = new Date(date.setMonth(date.getMonth() + 1));
      const endOfMonth = nextMonth.toISOString().split('T')[0];
      
      const { count, error } = await supabase
        .from('iso_leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)
        .lt('created_at', endOfMonth);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!currentMonth
  });

  // Query for status breakdown
  const { data: statusBreakdown, isLoading: loadingStatus } = useQuery({
    queryKey: ['iso-leads-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iso_leads')
        .select('status');
      
      if (error) throw error;
      
      // Count occurrences of each status
      const counts: {[key: string]: number} = {
        assigned: 0,
        in_progress: 0,
        converted: 0,
        rejected: 0,
        follow_up: 0,
        unassigned: 0
      };
      
      data.forEach(lead => {
        const status = lead.status || 'unassigned';
        counts[status] = (counts[status] || 0) + 1;
      });
      
      // Format for pie chart
      return Object.entries(counts).map(([name, value]) => ({
        name: name.replace('_', ' ').charAt(0).toUpperCase() + name.replace('_', ' ').slice(1),
        value
      }));
    }
  });
  
  // Calculate drop rate
  const dropRate = statusBreakdown ? 
    (((statusBreakdown.find(s => s.name === 'Rejected')?.value || 0) + 
      (statusBreakdown.find(s => s.name === 'Follow up')?.value || 0)) / 
      statusBreakdown.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1) : 
    '0.0';
  
  // Query for top performing agent
  const { data: topAgent, isLoading: loadingAgent } = useQuery({
    queryKey: ['iso-top-agent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iso_leads')
        .select(`
          assigned_agent_id,
          assigned_agent:profiles!assigned_agent_id(first_name, last_name)
        `)
        .eq('status', 'converted');
      
      if (error) throw error;
      
      // Count conversions by agent
      const agentCounts: {[key: string]: {count: number, name: string}} = {};
      
      data.forEach(lead => {
        if (lead.assigned_agent_id) {
          const agentId = lead.assigned_agent_id;
          const firstName = lead.assigned_agent?.first_name || 'Unknown';
          const lastName = lead.assigned_agent?.last_name || 'Agent';
          
          if (!agentCounts[agentId]) {
            agentCounts[agentId] = {
              count: 0,
              name: `${firstName} ${lastName}`
            };
          }
          
          agentCounts[agentId].count++;
        }
      });
      
      // Find agent with most conversions
      let topAgentId = '';
      let topCount = 0;
      let topName = 'No conversions yet';
      
      Object.entries(agentCounts).forEach(([agentId, data]) => {
        if (data.count > topCount) {
          topAgentId = agentId;
          topCount = data.count;
          topName = data.name;
        }
      });
      
      return { id: topAgentId, name: topName, count: topCount };
    }
  });
  
  const isLoading = loadingMonthly || loadingStatus || loadingAgent;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-6">
      {/* Leads This Month */}
      <StatsCard
        title="Leads This Month"
        value={monthlyLeads || 0}
        description={`Since ${new Date(currentMonth).toLocaleString('default', { month: 'long' })} 1st`}
        icon={<PieChart className="h-4 w-4 text-muted-foreground" />}
      />
      
      {/* Assigned vs Converted */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Lead Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <PieChartComponent data={statusBreakdown || []} />
          </div>
        </CardContent>
      </Card>
      
      {/* Drop Rate */}
      <StatsCard
        title="Drop Rate"
        value={`${dropRate}%`}
        description="Rejected or Follow-Up leads"
        icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
      />
      
      {/* Top Agent */}
      <StatsCard
        title="Top Performing Agent"
        value={topAgent?.name || 'None'}
        description={`${topAgent?.count || 0} converted leads`}
        icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}
