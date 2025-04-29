
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleCampaign } from "@/types/campaign";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CampaignDropdownProps {
  onCampaignChange?: (id: string) => void;
  value?: string;
  readOnly?: boolean;
}

export const CampaignDropdown = ({ 
  onCampaignChange, 
  value, 
  readOnly = false 
}: CampaignDropdownProps) => {
  const [campaigns, setCampaigns] = useState<SimpleCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>(value || "none");
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
          .limit(20);
        
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

  useEffect(() => {
    if (value) {
      setSelectedCampaign(value);
    }
  }, [value]);

  const handleCampaignChange = (value: string) => {
    setSelectedCampaign(value);
    if (onCampaignChange) {
      onCampaignChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="campaign">Assign to Campaign</Label>
      <Select 
        value={selectedCampaign} 
        onValueChange={handleCampaignChange} 
        disabled={readOnly || isLoading}
      >
        <SelectTrigger className="w-full" id="campaign">
          <SelectValue placeholder={isLoading ? "Loading campaigns..." : "Select a campaign"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Unassigned</SelectItem>
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
      <p className="text-xs text-muted-foreground">
        {selectedCampaign && selectedCampaign !== "none" ? "Leads will be assigned to the selected campaign" : "Leads will remain unassigned"}
      </p>
    </div>
  );
};
