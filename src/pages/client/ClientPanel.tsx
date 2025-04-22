
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressTracker } from "@/components/ai-agents/ProgressTracker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Bot, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AgentCallLogs } from "@/components/ai-agents/AgentCallLogs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type AgentData = {
  id: string;
  name: string;
  status: string;
  current_index: number;
  lead_list: string;
  created_at: string;
};

export default function ClientPanel() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: agents, isLoading } = useQuery({
    queryKey: ["client_agents", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching agents:", error);
        throw error;
      }
      
      return (data || []) as AgentData[];
    },
    enabled: !!userId,
  });

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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <Link to="/ai-agents">
            <Button>
              <Bot className="mr-2 h-4 w-4" />
              Create New Agent
            </Button>
          </Link>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            This dashboard shows all your active AI agents and their progress. You can view the logs for each agent but cannot modify their status.
          </AlertDescription>
        </Alert>

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
                    <CardTitle>{agent.name || "Unnamed Agent"}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(agent.status) as any} className="capitalize">
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(agent.created_at).toLocaleDateString()}
                    </div>
                    <ProgressTracker 
                      currentIndex={agent.current_index} 
                      leadList={agent.lead_list} 
                    />
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-2">Call Logs</h3>
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
                    You haven't created any AI agents yet.
                  </p>
                  <Link to="/ai-agents" className="mt-4">
                    <Button>
                      <Bot className="mr-2 h-4 w-4" />
                      Create Your First Agent
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
