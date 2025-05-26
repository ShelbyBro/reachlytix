
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Mail } from "lucide-react";

type Props = {
  campaignId: string;
  disabled?: boolean;
  onSuccess?: () => void;
};

export function StartCampaignButton({ campaignId, disabled, onSuccess }: Props) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleClick = async () => {
    setSending(true);
    try {
      // Fetch assigned leads
      const { data: assigned, error: clError } = await supabase
        .from("campaign_leads")
        .select("lead_id")
        .eq("campaign_id", campaignId);

      // If no leads assigned: try to assign all available user leads for this campaign (fallback)
      if (clError) throw clError;
      if (!assigned || assigned.length === 0) {
        // Look for leads uploaded by this user for this campaign (not assigned yet)
        toast({
          variant: "destructive",
          title: "No leads assigned",
          description: "Please assign leads to this campaign before starting.",
        });
        setSending(false);
        return;
      }

      // Fetch leads data
      const leadIds = assigned.map((r: any) => r.lead_id);
      if (!leadIds.length) {
        toast({
          variant: "destructive",
          title: "No leads assigned",
          description: "Please assign at least one lead and save before starting the campaign.",
        });
        setSending(false);
        return;
      }
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
        await new Promise((res) => setTimeout(res, 200)); // fake delay
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

  return (
    <Button onClick={handleClick} disabled={disabled || sending}>
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
  );
}
