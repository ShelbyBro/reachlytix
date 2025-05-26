import { StartCampaignButton } from "./StartCampaignButton";
import { SimpleCampaign } from "@/types/campaign";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type CampaignDetailsViewProps = {
  campaign: SimpleCampaign;
  onCampaignSent?: () => void;
};

export function CampaignDetailsView({ campaign, onCampaignSent }: CampaignDetailsViewProps) {
  const [script, setScript] = useState<any>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const isEmail = campaign.type === "email";

  // Fetch subject/content for EMAIL only
  useEffect(() => {
    async function fetchScript() {
      if (isEmail && campaign.script_id) {
        const { data, error } = await supabase.from("scripts").select("*").eq("id", campaign.script_id).maybeSingle();
        if (!error && data) setScript(data);
      }
    }
    fetchScript();
  }, [campaign]);

  // Fetch recipients (all assigned leads) for EMAIL only
  useEffect(() => {
    async function fetchRecipients() {
      if (isEmail) {
        const { data, error } = await supabase
          .from("campaign_leads")
          .select("lead:leads(*)")
          .eq("campaign_id", campaign.id);
        if (!error && data) {
          // leads will be inside .lead
          setRecipients(data.map((row: any) => row.lead));
        }
      }
    }
    fetchRecipients();
  }, [campaign]);

  // Simulate sending emails when Start Campaign is clicked (EMAIL only)
  const handleStartEmailCampaign = async () => {
    setSending(true);
    try {
      let sentCount = 0;
      for (const lead of recipients) {
        if (lead?.email) {
          // Simulate send (replace with API call to /functions/send-email if needed)
          console.log(`[MOCK EMAIL] Sending "${script?.subject || script?.title}" to ${lead.email}: ${script?.content}`);
          sentCount++;
          await new Promise((res) => setTimeout(res, 60));
        }
      }

      // Mark campaign as sent
      await supabase
        .from("campaigns")
        .update({ status: "sent", schedule_status: "completed" })
        .eq("id", campaign.id);

      toast({
        title: "Campaign sent",
        description: `Sent to ${sentCount} recipient${sentCount === 1 ? "" : "s"}`,
      });
      if (onCampaignSent) onCampaignSent();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: err?.message || "Email campaign send error.",
      });
    }
    setSending(false);
  };

  // Only email campaigns get the details page updates
  if (!isEmail) {
    // ... keep existing code for SMS/AI (unchanged, just fallback) ...
    return (
      <div>
        {/* ... campaign fields ... */}
        {campaign.status !== "sent" && (
          <div className="my-4">
            <StartCampaignButton campaignId={campaign.id} onSuccess={onCampaignSent} />
          </div>
        )}
        {/* ... rest of details ... */}
      </div>
    );
  }

  // Email campaign details view
  return (
    <div className="max-w-2xl mx-auto bg-card rounded-lg p-8 shadow space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">{campaign.title}</h2>
        <div className="text-muted-foreground mb-2">{campaign.description}</div>
        <div className="flex gap-6 items-center my-1">
          <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs">Email Campaign</span>
          <span className="text-xs text-muted-foreground">Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
          <span className="text-xs text-muted-foreground">Status: {campaign.status || "draft"}</span>
        </div>
      </div>
      <div>
        <h3 className="text-md font-bold mb-1">Email Subject:</h3>
        <div className="border rounded bg-muted px-3 py-1">{script?.subject || script?.title || "—"}</div>
      </div>
      <div>
        <h3 className="text-md font-bold mb-1">Email Body:</h3>
        <div className="border rounded bg-muted px-3 py-2 whitespace-pre-line">{script?.content || "—"}</div>
      </div>
      <div>
        <strong>Recipients:</strong>{" "}
        {recipients.length > 0 ? (
          <span>{recipients.length} loaded</span>
        ) : (
          <span className="text-muted-foreground">None assigned.</span>
        )}
      </div>
      {campaign.status !== "sent" && (
        <div>
          <Button onClick={handleStartEmailCampaign} disabled={sending || recipients.length === 0}>
            {sending ? "Sending..." : "Start Campaign"}
          </Button>
        </div>
      )}
    </div>
  );
}
