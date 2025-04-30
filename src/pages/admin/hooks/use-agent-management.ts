
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAgentManagement() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: agents, isLoading: isAgentsLoading, refetch } = useQuery({
    queryKey: ["admin_agents", statusFilter, clientFilter],
    queryFn: async () => {
      try {
        console.log("Fetching agents with filters:", { statusFilter, clientFilter });
        
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
          setError(error);
          throw error;
        }
        
        console.log("Retrieved agents data:", data);
        return data || [];
      } catch (err) {
        console.error("Error in agents query function:", err);
        setError(err instanceof Error ? err : new Error("Unknown error in agents query"));
        return []; // Return empty array to prevent component crash
      }
    },
    meta: {
      onError: (err: Error) => {
        console.error("Query error for agents:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch agents"));
      }
    }
  });

  const { data: clients, isLoading: isClientsLoading } = useQuery({
    queryKey: ["admin_clients"],
    queryFn: async () => {
      try {
        console.log("Fetching clients data");
        
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .eq("role", "client");
        
        if (error) {
          console.error("Error fetching clients:", error);
          throw error;
        }
        
        const formattedClients = data.map(client => ({
          id: client.id,
          name: `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unknown',
        }));
        
        console.log("Retrieved clients data:", formattedClients);
        return formattedClients;
      } catch (err) {
        console.error("Error in clients query function:", err);
        return []; // Return empty array to prevent component crash
      }
    },
    meta: {
      onError: (err: Error) => {
        console.error("Query error for clients:", err);
      }
    }
  });

  const handleToggleStatus = async (agent: any) => {
    try {
      setUpdatingStatus(true);
      const newStatus = agent.status === 'running' ? 'inactive' : 'running';
      
      console.log("Toggling agent status:", { agentId: agent.id, currentStatus: agent.status, newStatus });
      
      const { error } = await supabase
        .from('ai_agents')
        .update({ status: newStatus })
        .eq('id', agent.id);

      if (error) {
        console.error("Error toggling agent status:", error);
        throw error;
      }

      await refetch();
      
      toast({
        title: `Agent ${newStatus === 'running' ? 'resumed' : 'paused'}`,
        description: `${agent.name} has been ${newStatus === 'running' ? 'resumed' : 'paused'}.`,
      });
    } catch (error) {
      console.error("Toggle status error:", error);
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
      console.log("Resetting agent:", { agentId: agent.id });
      
      const { error } = await supabase
        .from('ai_agents')
        .update({ 
          current_index: 0,
          status: 'pending'
        })
        .eq('id', agent.id);

      if (error) {
        console.error("Error resetting agent:", error);
        throw error;
      }

      toast({
        title: "Agent reset successfully",
        description: `${agent.name} will start from the beginning.`,
      });
      
      refetch();
    } catch (error) {
      console.error("Reset agent error:", error);
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
      console.log("Deleting agent:", { agentId, agentName });
      
      const { error } = await supabase
        .from('ai_agents')
        .delete()
        .eq('id', agentId);

      if (error) {
        console.error("Error deleting agent:", error);
        throw error;
      }

      toast({
        title: "Agent deleted",
        description: `${agentName} has been deleted successfully.`,
      });
      
      refetch();
    } catch (error) {
      console.error("Delete agent error:", error);
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
    if (!leadList) return 0;
    return leadList.split(',').length; 
  };

  const isLoading = isAgentsLoading || isClientsLoading;

  return {
    agents,
    isLoading,
    error,
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
