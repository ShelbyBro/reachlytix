
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressTracker } from "@/components/ai-agents/ProgressTracker";
import { Badge } from "@/components/ui/badge";
import { AgentCallLogs } from "@/components/ai-agents/AgentCallLogs";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, Play, Pause, RefreshCw, Trash, Filter, Users 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ResetAgentDialog } from "@/components/ai-agents/ResetAgentDialog";

type AgentData = {
  id: string;
  name: string;
  status: string;
  current_index: number;
  lead_list: string;
  created_at: string;
  client_id: string | null;
  business_type: string | null;
  voice_style: string | null;
};

type ClientData = {
  id: string;
  name: string;
  email: string;
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Fetch all agents
  const { data: agents, isLoading, refetch } = useQuery({
    queryKey: ["admin_agents", statusFilter, clientFilter],
    queryFn: async () => {
      let query = supabase
        .from("ai_agents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      
      if (clientFilter) {
        query = query.eq("client_id", clientFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching agents:", error);
        throw error;
      }
      
      return (data || []) as AgentData[];
    },
  });

  // Fetch all clients for the filter
  const { data: clients } = useQuery({
    queryKey: ["admin_clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("role", "client");
      
      if (error) {
        console.error("Error fetching clients:", error);
        throw error;
      }
      
      return data.map(client => ({
        id: client.id,
        name: `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unknown',
      }));
    },
  });

  const handleToggleStatus = async (agent: AgentData) => {
    setUpdatingStatus(true);
    const newStatus = agent.status === 'running' ? 'inactive' : 'running';
    
    try {
      const { error } = await supabase
        .from('ai_agents')
        .update({ status: newStatus })
        .eq('id', agent.id);

      if (error) throw error;

      await refetch();
      
      toast({
        title: `Agent ${newStatus === 'running' ? 'resumed' : 'paused'}`,
        description: `${agent.name} has been ${newStatus === 'running' ? 'resumed' : 'paused'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agent status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResetAgent = async () => {
    if (!selectedAgent) return;
    
    setResetting(true);
    try {
      const { error } = await supabase
        .from('ai_agents')
        .update({ 
          current_index: 0,
          status: 'pending'
        })
        .eq('id', selectedAgent.id);

      if (error) throw error;

      toast({
        title: "Agent reset successfully",
        description: "The agent will start from the beginning.",
      });
      
      setResetDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset the agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${agentName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('ai_agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Agent deleted",
        description: `${agentName} has been deleted successfully.`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case 'running':
        return 'success';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'inactive':
        return 'outline';
      default:
        return 'secondary';
    }
  }

  function countLeads(leadList: string): number {
    return leadList ? leadList.split(',').length : 0;
  }

  return (
    <Layout isAdmin>
      <ResetAgentDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={handleResetAgent}
        loading={resetting}
        agentName={selectedAgent?.name || ""}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Status:</span>
              <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Client:</span>
              <Select value={clientFilter || ""} onValueChange={(value) => setClientFilter(value || null)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All clients</SelectItem>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="w-full">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : agents && agents.length > 0 ? (
            agents.map((agent) => (
              <Card key={agent.id} className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{agent.name || "Unnamed Agent"}</CardTitle>
                      <div className="text-sm text-muted-foreground mt-1">
                        Business: {agent.business_type || "Not specified"} | Voice: {agent.voice_style || "Default"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(agent.status) as any} className="capitalize">
                        {agent.status}
                      </Badge>
                      <div className="text-sm font-medium">
                        Total Leads: {countLeads(agent.lead_list)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground flex justify-between">
                      <span>Created: {new Date(agent.created_at).toLocaleDateString()}</span>
                      <span>Client ID: {agent.client_id || "No client"}</span>
                    </div>
                    <ProgressTracker 
                      currentIndex={agent.current_index} 
                      leadList={agent.lead_list} 
                    />
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <h3 className="text-sm font-medium">Call Logs</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingStatus || agent.status === 'completed'}
                        onClick={() => handleToggleStatus(agent)}
                      >
                        {agent.status === 'running' ? (
                          <><Pause className="h-4 w-4 mr-1" /> Pause</>
                        ) : (
                          <><Play className="h-4 w-4 mr-1" /> Resume</>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setResetDialogOpen(true);
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" /> Reset
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteAgent(agent.id, agent.name || "Unnamed Agent")}
                      >
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <AgentCallLogs agentId={agent.id} />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No AI Agents Found</h3>
                  <p className="text-muted-foreground mt-2">
                    No agents match the current filters.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
