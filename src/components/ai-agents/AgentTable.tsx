
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { StartCampaignDialog } from "./StartCampaignDialog";
import { Play } from "lucide-react";

export function AgentTable() {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleStartCampaign = async () => {
    if (!selectedAgent) return;
    
    setLoading(true);
    try {
      console.log("Starting campaign for agent:", selectedAgent.name);
      
      // Instead of using raw fetch, use Supabase's function invoker
      const { data, error } = await supabase.functions.invoke('start-agent-campaign', {
        body: {
          agentName: selectedAgent.name,
          script: selectedAgent.greeting_script,
          voiceStyle: selectedAgent.voice_style,
          businessType: selectedAgent.business_type
        }
      });

      console.log("Response data:", data);
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Failed to start campaign: ${error.message}`);
      }

      toast({
        title: `Campaign started for ${selectedAgent.name}!`,
        description: "Your AI agent campaign has been initiated successfully.",
      });

      setDialogOpen(false);
    } catch (error) {
      console.error("Campaign start error:", error);
      toast({
        title: "Error",
        description: "Failed to start agent campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Voice Style</TableHead>
            <TableHead>Business Type</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>{agent.name || "Unnamed Agent"}</TableCell>
              <TableCell>{agent.voice_style || "Default"}</TableCell>
              <TableCell>{agent.business_type || "Default"}</TableCell>
              <TableCell>
                {agent.created_at ? new Date(agent.created_at).toLocaleString() : ""}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAgent(agent);
                    setDialogOpen(true);
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Campaign
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
