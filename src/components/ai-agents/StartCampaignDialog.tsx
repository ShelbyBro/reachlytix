import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AiAgentCampaignStarter() {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // TEMP HARDCODE — REPLACE with your actual agent ID and name
  const agentId = "REPLACE_WITH_AGENT_ID";
  const agentName = "My AI Agent";

  const handleStartCampaign = async () => {
    setLoading(true);
    try {
      if (!agentId) {
        toast({
          variant: "destructive",
          title: "Agent ID missing",
          description: "Cannot start campaign without an agent.",
        });
        return;
      }

      const { error } = await supabase
        .from("agents") // Change to "campaigns" if your table is called that
        .update({
          status: "running",
          started_at: new Date().toISOString(),
        })
        .eq("id", agentId);

      if (error) {
        console.error("🔥 Supabase Error:", error);
        throw error;
      }

      toast({
        title: "AI Agent Campaign Started",
        description: `${agentName} is now running.`,
      });

      setOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to Start Campaign",
        description: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Start Campaign</Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start AI Agent Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start a campaign with {agentName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartCampaign} disabled={loading}>
              {loading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Campaign"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
