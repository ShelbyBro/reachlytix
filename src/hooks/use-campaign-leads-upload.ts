
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook for uploading leads for a specific campaign, 
 * assigning them directly to that campaign.
 */
export function useCampaignLeadsUpload(campaignId: string | undefined) {
  const [uploadedLeads, setUploadedLeads] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadLeads = async (csvLeads: { name: string, email: string, phone: string, source?: string }[]) => {
    if (!user || !campaignId) return;

    setUploading(true);
    try {
      // Insert leads: use created_by = auth.uid()
      const leadsInsert = csvLeads.map((l) => ({
        ...l,
        created_by: user.id,
        client_id: user.id,
        status: "new",
        source: l.source || "uploaded",
      }));

      const { data: leads, error: leadError } = await supabase
        .from("leads")
        .insert(leadsInsert)
        .select();

      if (leadError) throw leadError;

      // Map leads to campaign_leads
      const campaignLeads = leads.map((lead: any) => ({
        campaign_id: campaignId,
        lead_id: lead.id,
        created_at: new Date().toISOString(),
      }));
      const { error: campLeadError } = await supabase
        .from("campaign_leads")
        .insert(campaignLeads);

      if (campLeadError) throw campLeadError;

      setUploadedLeads(leads);
      toast({ title: "Leads uploaded", description: `${leads.length} lead${leads.length === 1 ? "" : "s"} assigned to campaign.` });
      return leads;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
      return [];
    } finally {
      setUploading(false);
    }
  };

  // Helper to show how many unique leads are currently uploaded for this campaign in this session.
  return {
    uploadedLeads,
    uploading,
    uploadLeads,
    setUploadedLeads, // Allow manual clearing if needed
    clearLeads: () => setUploadedLeads([]),
  };
}
