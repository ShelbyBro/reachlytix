
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleCampaign } from "@/types/campaign";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const CampaignDropdown = () => {
  const [campaigns, setCampaigns] = useState<SimpleCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("campaigns")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (error) throw error;
        setCampaigns(data as SimpleCampaign[]);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [user]);

  const handleCampaignChange = (value: string) => {
    setSelectedCampaign(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="campaign">Assign to Campaign</Label>
      <Select value={selectedCampaign} onValueChange={handleCampaignChange}>
        <SelectTrigger className="w-full" id="campaign">
          <SelectValue placeholder={isLoading ? "Loading campaigns..." : "Select a campaign"} />
        </SelectTrigger>
        <SelectContent>
          {campaigns.map((campaign) => (
            <SelectItem key={campaign.id} value={campaign.id}>
              {campaign.title}
            </SelectItem>
          ))}
          {campaigns.length === 0 && !isLoading && (
            <SelectItem value="no-campaigns" disabled>
              No campaigns available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
