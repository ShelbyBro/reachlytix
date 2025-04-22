
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Play, Trash, RefreshCw, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { StartCampaignDialog } from "./StartCampaignDialog";
import { ResetAgentDialog } from "./ResetAgentDialog";
import { useState } from "react";
import { AgentCallLogs } from "./AgentCallLogs";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressTracker } from "./ProgressTracker";

type Agent = {
  id: string;
  name: string;
  voice_style: string;
  business_type: string;
  greeting_script: string;
  created_at: string | null;
  current_index: number;
  lead_list: string;
  status: string; // Added the status property here
};

interface AgentDBResponse {
  id: string;
  client_id: string | null;
  name?: string;
  voice_style?: string;
  business_type?: string;
  greeting_script?: string;
  campaign_id?: string | null;
  notes?: string | null;
  status?: string | null;
  created_at: string | null;
  current_index?: number;
  lead_list?: string;
}

export function MyAgentList() {
  const { user } = useAuth();
  const userId = user?.id;
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ai_agents_custom", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((agent: AgentDBResponse): Agent => ({
        id: agent.id,
        name: agent.name || "Unnamed Agent",
        voice_style: agent.voice_style || "Default",
        business_type: agent.business_type || "Default",
        greeting_script: agent.greeting_script || "No greeting script",
        created_at: agent.created_at,
        current_index: agent.current_index || 0,
        lead_list: agent.lead_list || "",
        status: agent.status || "pending"
      })) as Agent[];
    },
    enabled: !!userId,
  });

  const handleStartCampaign = async () => {
    if (!selectedAgent) return;
    
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('start-agent-campaign', {
        body: {
          agentName: selectedAgent.name,
          script: selectedAgent.greeting_script,
          voiceStyle: selectedAgent.voice_style,
          businessType: selectedAgent.business_type
        }
      });

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "AI Campaign started successfully!",
        description: "You can track its progress in Recent Agent Campaigns.",
      });
      
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start the campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const handleToggleStatus = async (agent: Agent) => {
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

  return (
    <>
      <StartCampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleStartCampaign}
        loading={loading}
        agentName={selectedAgent?.name || ""}
        agentId={selectedAgent?.id || ""}
      />

      <ResetAgentDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={handleResetAgent}
        loading={resetting}
        agentName={selectedAgent?.name || ""}
      />

      <div className="mt-2">
        <h3 className="text-xl font-semibold mb-3">My Saved Agents</h3>
        <div>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="p-4 flex flex-col gap-2">
                  <div className="flex gap-3 items-center">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-6 w-full" />
                </Card>
              ))}
            </div>
          ) : data && data.length ? (
            <div className="flex flex-col gap-4">
              {data.map(agent => (
                <Card key={agent.id} className="p-4">
                  <div className="flex gap-3 items-center mb-2">
                    <div className="font-bold text-lg">{agent.name}</div>
                    <Badge variant="secondary" className="capitalize">{agent.voice_style}</Badge>
                    <Badge variant="outline" className="capitalize">{agent.business_type}</Badge>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {agent.created_at ? new Date(agent.created_at).toLocaleString() : ""}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="ml-2"
                      onClick={() => {
                        setSelectedAgent(agent);
                        setDialogOpen(true);
                      }}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="ml-1"
                      disabled={updatingStatus || agent.status === 'completed'}
                      onClick={() => handleToggleStatus(agent)}
                    >
                      {agent.status === 'running' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="ml-1"
                      onClick={() => {
                        setSelectedAgent(agent);
                        setResetDialogOpen(true);
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-1"
                      aria-label="Delete Agent"
                      tabIndex={-1}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <ProgressTracker 
                    currentIndex={agent.current_index} 
                    leadList={agent.lead_list} 
                  />
                  
                  <div className="italic text-sm text-muted-foreground bg-muted px-2 py-1 rounded mt-3">
                    {agent.greeting_script}
                  </div>
                  
                  <AgentCallLogs agentId={agent.id} />
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex gap-2 items-center text-sm text-muted-foreground py-4">
              <AlertCircle className="w-5 h-5" /> No agents found.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
