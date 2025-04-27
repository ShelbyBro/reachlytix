
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAgentManagement() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
      
      return data || [];
    },
  });

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

  const handleToggleStatus = async (agent: any) => {
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

  const handleResetAgent = async (agent: any) => {
    try {
      const { error } = await supabase
        .from('ai_agents')
        .update({ 
          current_index: 0,
          status: 'pending'
        })
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: "Agent reset successfully",
        description: `${agent.name} will start from the beginning.`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset the agent. Please try again.",
        variant: "destructive",
      });
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

  const getStatusBadgeVariant = (status: string) => {
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
  };

  const countLeads = (leadList: string): number => {
    return leadList ? leadList.split(',').length : 0;
  };

  return {
    agents,
    isLoading,
    clients,
    statusFilter,
    setStatusFilter,
    clientFilter,
    setClientFilter,
    updatingStatus,
    handleToggleStatus,
    handleDeleteAgent,
    handleResetAgent,
    getStatusBadgeVariant,
    countLeads,
  };
}
