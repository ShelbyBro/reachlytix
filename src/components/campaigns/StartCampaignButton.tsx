
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Mail } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  campaignId: string;
  disabled?: boolean;
  onSuccess?: () => void;
  leadIds?: string[];
};

export function StartCampaignButton({ campaignId, disabled, onSuccess, leadIds = [] }: Props) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleClick = async () => {
    setSending(true);
    try {
      if (!leadIds.length) {
        toast({
          variant: "destructive",
          title: "No leads assigned",
          description: "Please assign leads to this campaign before starting.",
        });
        setSending(false);
        return;
      }

      // Remove any existing assignments
      await supabase.from("campaign_leads").delete().eq("campaign_id", campaignId);

      // Insert new campaign_leads
      const inserts = leadIds.map(lead_id => ({
        campaign_id: campaignId,
        lead_id,
        created_at: new Date().toISOString(),
      }));
      if (inserts.length) {
        const { error } = await supabase.from("campaign_leads").insert(inserts);
        if (error) {
          toast({
            variant: "destructive",
            title: "Error assigning leads",
            description: error.message,
          });
          setSending(false);
          return;
        }
      }

      // Fetch leads data
      const { data: leads, error: lError } = await supabase
        .from("leads")
        .select("*")
        .in("id", leadIds);

      if (lError) throw lError;
      if (!leads || leads.length === 0) {
        toast({
          variant: "destructive",
          title: "No valid leads found",
          description: "No valid leads found to send campaign to.",
        });
        setSending(false);
        return;
      }

      // Mock send emails (for now)
      let emailsSent = 0;
      for (const lead of leads) {
        if (!lead.email) continue;
        // Simulate email send: log or fake API call
        console.log(`[Mock] Sent email for campaign ${campaignId} to ${lead.email} (lead ${lead.id})`);
        emailsSent++;
        await new Promise((res) => setTimeout(res, 150)); // small delay
      }

      // Mark campaign as sent
      const { error: upError } = await supabase
        .from("campaigns")
        .update({ status: "sent", schedule_status: "completed" })
        .eq("id", campaignId);

      if (upError) throw upError;

      toast({
        title: "Campaign sent",
        description: `Emails sent to ${emailsSent} lead${emailsSent === 1 ? "" : "s"}.`,
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to send", description: error.message });
    }
    setSending(false);
  };

  // If no leads available, disable button and show tooltip
  const finalDisabled = disabled || leadIds.length === 0 || sending;
  const triggerElem = (
    <span>
      <Button onClick={handleClick} disabled={finalDisabled}>
        {sending ? (
          <>
            <Mail className="mr-2 animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Check className="mr-2" /> Start Campaign
          </>
        )}
      </Button>
    </span>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{triggerElem}</TooltipTrigger>
        {leadIds.length === 0 && (
          <TooltipContent>
            Upload and select at least one lead before you can start a campaign.
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
