
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type EmailCampaignDetailsProps = {
  campaign: {
    id: string;
    title: string;
    description?: string;
    type: string;
    scheduled_at?: string;
    created_at?: string;
    status?: string;
  };
};

export default function EmailCampaignDetails({ campaign }: EmailCampaignDetailsProps) {
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchLeadsCount() {
      if (!campaign?.id) return;
      const { count, error } = await supabase
        .from("campaign_leads")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", campaign.id);

      if (!error) setLeadCount(count || 0);
    }
    fetchLeadsCount();
  }, [campaign?.id]);

  const handleStartCampaign = async () => {
    setSending(true);
    try {
      // Simulate send by updating status to "sent"
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "sent", schedule_status: "completed" })
        .eq("id", campaign.id);

      if (error) throw error;

      toast.success("Campaign marked as sent.");
      // Optionally, you could refetch or reload page.
    } catch (err: any) {
      toast.error("Failed to start campaign: " + (err.message || "Unknown error"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto border rounded-lg p-6 bg-background">
      <h1 className="text-2xl font-bold mb-2">{campaign.title}</h1>
      <p className="mb-2 text-muted-foreground">{campaign.description}</p>
      {campaign.scheduled_at && (
        <div className="mb-2 text-sm">
          <b>Scheduled At:</b> {new Date(campaign.scheduled_at).toLocaleString()}
        </div>
      )}
      <div className="mb-2 text-sm">
        <b>Status: </b>
        <span className="inline-block px-2 py-1 rounded bg-muted text-xs">{campaign.status}</span>
      </div>
      <div className="mb-2 text-sm">
        <b>Recipients:</b> {leadCount === null ? <Loader2 className="inline animate-spin w-4 h-4 mx-1" /> : leadCount}
      </div>
      <hr className="my-4" />
      <div className="mb-4">
        <b>Campaign Content</b>
        <div className="text-sm mt-1 italic">Subject + Body (to be implemented in content fields)</div>
      </div>
      <Button 
        size="lg" 
        onClick={handleStartCampaign} 
        className="mt-2"
        disabled={sending || leadCount === 0}
      >
        {sending ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : <Send className="w-4 h-4 mr-1" />}
        {sending ? "Sending..." : "Start Campaign"}
      </Button>
    </div>
  );
}
