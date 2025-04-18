
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SimpleCampaign, SimpleLead, SimpleScript } from "@/types/campaign";

export const useCampaigns = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<SimpleCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignLeads, setCampaignLeads] = useState<Record<string, SimpleLead[]>>({});
  const [campaignScripts, setCampaignScripts] = useState<Record<string, SimpleScript>>({});

  const fetchCampaignLeads = async (campaigns: SimpleCampaign[]) => {
    try {
      const leadsByIds: Record<string, SimpleLead[]> = {};
      
      await Promise.all(
        campaigns.map(async (campaign) => {
          const { data, error } = await supabase
            .from("leads")
            .select("*")
            .eq("client_id", campaign.client_id);
            
          if (error) throw error;
          leadsByIds[campaign.id] = data as SimpleLead[];
        })
      );
      
      setCampaignLeads(leadsByIds);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const fetchCampaignScripts = async (campaigns: SimpleCampaign[]) => {
    try {
      const scriptsByIds: Record<string, SimpleScript> = {};
      
      await Promise.all(
        campaigns.filter(c => c.script_id).map(async (campaign) => {
          const { data, error } = await supabase
            .from("scripts")
            .select("*")
            .eq("id", campaign.script_id)
            .single();
            
          if (error) {
            console.error(`Error fetching script for campaign ${campaign.id}:`, error);
            return;
          }
          
          scriptsByIds[campaign.id] = data as SimpleScript;
        })
      );
      
      setCampaignScripts(scriptsByIds);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const { data: campaignsData, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const campaigns = campaignsData as SimpleCampaign[];
      setCampaigns(campaigns);
      
      await Promise.all([
        fetchCampaignLeads(campaigns),
        fetchCampaignScripts(campaigns)
      ]);
      
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load campaigns."
      });
    } finally {
      setCampaignsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    campaignsLoading,
    campaignLeads,
    campaignScripts,
    refetchCampaigns: fetchCampaigns
  };
};
