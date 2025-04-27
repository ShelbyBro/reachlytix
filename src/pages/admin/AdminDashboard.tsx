
import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { ResetAgentDialog } from "@/components/ai-agents/ResetAgentDialog";
import { AdminFilters } from "./components/AdminFilters";
import { AgentCard } from "./components/AgentCard";
import { useAgentManagement } from "./hooks/use-agent-management";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const {
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
    getStatusBadgeVariant,
    countLeads,
  } = useAgentManagement();

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

        <AdminFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          clients={clients}
        />

        <div className="grid gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="w-full">
                <CardContent className="space-y-3 p-6">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : agents && agents.length > 0 ? (
            agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onToggleStatus={handleToggleStatus}
                onReset={(agent) => {
                  setSelectedAgent(agent);
                  setResetDialogOpen(true);
                }}
                onDelete={handleDeleteAgent}
                updatingStatus={updatingStatus}
                getStatusBadgeVariant={getStatusBadgeVariant}
                countLeads={countLeads}
              />
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
