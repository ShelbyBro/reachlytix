
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UploadOptionsProps {
  source: string;
  campaignId?: string;
  onSourceChange: (value: string) => void;
  onCampaignChange: (value: string) => void;
  disabled?: boolean;
}

const sourceOptions = ["Facebook", "LinkedIn", "Website", "Manual", "Other"];

export function UploadOptions({
  source,
  campaignId,
  onSourceChange,
  onCampaignChange,
  disabled,
}: UploadOptionsProps) {
  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">Lead Source <span className="text-destructive">*</span></Label>
          <Select
            value={source}
            onValueChange={onSourceChange}
            disabled={disabled}
          >
            <SelectTrigger id="source">
              <SelectValue placeholder="Select lead source" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign">Assign to Campaign (Optional)</Label>
          <Select
            value={campaignId || ""}
            onValueChange={onCampaignChange}
            disabled={disabled}
          >
            <SelectTrigger id="campaign">
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns?.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
