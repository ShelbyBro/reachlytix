
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

      if (clError) throw clError;
      if (!assigned || assigned.length === 0) throw new Error("No leads assigned.");

      // Fetch leads data
      const leadIds = assigned.map((r: any) => r.lead_id);
      const { data: leads, error: lError } = await supabase
        .from("leads")
        .select("*")
        .in("id", leadIds);

      if (lError) throw lError;

      // Simulate sending emails one by one
      for (const lead of leads) {
        if (!lead.email) continue;
        // Simulate email send: log or fake API call
        console.log(`[Mock] Sent email for campaign ${campaignId} to ${lead.email} (lead ${lead.id})`);
        // (Optional) Insert into campaign_logs for tracking:
        // await supabase.from("campaign_logs").insert({
        //   campaign_id: campaignId, lead_id: lead.id, delivery_status: "sent", message_type: "email"
        // });
        await new Promise((res) => setTimeout(res, 300)); // fake delay
      }

      // Mark campaign as sent
      const { error: upError } = await supabase
        .from("campaigns")
        .update({ status: "sent", schedule_status: "completed" })
        .eq("id", campaignId);

      if (upError) throw upError;

      toast({
        title: "Campaign Sent Successfully",
        description: `Emails sent to ${leads.length} leads${leads.length > 0 ? "!" : ""} (mocked)`,
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to Send", description: error.message });
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
