
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SimpleCampaign, SimpleLead, SimpleScript } from "@/types/campaign";
import { useAuth } from "@/contexts/AuthContext";

export const useCampaigns = () => {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [campaigns, setCampaigns] = useState<SimpleCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignLeads, setCampaignLeads] = useState<Record<string, SimpleLead[]>>({});
  const [campaignScripts, setCampaignScripts] = useState<Record<string, SimpleScript>>({});
  const [fetchAttempted, setFetchAttempted] = useState(false);

  const fetchCampaignLeads = async (campaigns: SimpleCampaign[]) => {
    try {
      const leadsByIds: Record<string, SimpleLead[]> = {};
      
      await Promise.all(
        campaigns.map(async (campaign) => {
          if (!campaign.client_id) return;
          
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
          if (!campaign.script_id) return;
          
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
    if (!user) {
      setCampaignsLoading(false);
      setFetchAttempted(true);
      return;
    }
    
    try {
      setCampaignsLoading(true);
      
      // The RLS policies will automatically filter campaigns based on the user's role
      const { data: campaignsData, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const campaigns = campaignsData as SimpleCampaign[];
      setCampaigns(campaigns);
      
      if (campaigns.length > 0) {
        await Promise.all([
          fetchCampaignLeads(campaigns),
          fetchCampaignScripts(campaigns)
        ]);
      }
      
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load campaigns."
      });
    } finally {
      setCampaignsLoading(false);
      setFetchAttempted(true);
    }
  };

  useEffect(() => {
    // Only fetch if user is authenticated and we have role information
    if (user && role) {
      console.log("Fetching campaigns with role:", role);
      fetchCampaigns();
    } else {
      // Mark as not loading if no user
      setCampaignsLoading(false);
      if (!user) {
        setFetchAttempted(true);
      }
    }
  }, [user, role]);

  return {
    campaigns,
    campaignsLoading,
    campaignLeads,
    campaignScripts,
    fetchAttempted,
    refetchCampaigns: fetchCampaigns
  };
};
