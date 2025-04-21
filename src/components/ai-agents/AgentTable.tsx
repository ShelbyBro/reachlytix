
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
      const response = await fetch(
        "https://szkhnwedzwvlqlktgvdp.supabase.co/functions/v1/start-ai-agent-call",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: selectedAgent.id,
            script: selectedAgent.greeting_script,
            phone: "+11234567890", // This should be configured per agent or campaign
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to start campaign");

      toast({
        title: "Campaign Started",
        description: "Your AI agent campaign has been initiated successfully.",
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

  return (
    <>
      <StartCampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleStartCampaign}
        loading={loading}
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
