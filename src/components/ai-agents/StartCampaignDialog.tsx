
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

interface StartCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
  agentName: string;
  agentId: string;
}

export function StartCampaignDialog({
  open,
  onOpenChange,
  loading,
  agentName,
  agentId
}: StartCampaignDialogProps) {
  const { toast } = useToast();
  const [localLoading, setLocalLoading] = useState(false);

  const handleStartCampaign = async () => {
    setLocalLoading(true);
    try {
      const { error } = await supabase
        .from("ai_agents")
        .update({
          status: "running",
          started_at: new Date().toISOString(),
        })
        .eq("id", agentId);

      if (error) throw error;

      toast({
        title: "Campaign Started",
        description: `${agentName} is now running.`,
      });

      onOpenChange(false);
    } catch (err: any) {
      console.error("Error starting campaign:", err);
      toast({
        variant: "destructive",
        title: "Failed to Start Campaign",
        description: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start AI Agent Campaign</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to start a campaign with {agentName}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={localLoading || loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleStartCampaign} 
            disabled={localLoading || loading}
          >
            {localLoading ? (
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
  );
}
