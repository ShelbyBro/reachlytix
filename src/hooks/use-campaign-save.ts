
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SimpleCampaign } from "@/types/campaign";
import { useCampaignScript } from "./use-campaign-script";

export const useCampaignSave = (
  editingCampaign: SimpleCampaign | null,
  onSuccess: () => void
) => {
  const { toast } = useToast();
  const { saveScript } = useCampaignScript();

  const updateCampaign = async (
    campaignData: {
      title: string;
      description: string;
      scheduled_at?: string;
      type: string;
    },
    scriptData: {
      subject: string;
      content: string;
      type: string;
    }
  ) => {
    if (!editingCampaign) return;

    const { error: scriptError } = await supabase
      .from("scripts")
      .update({
        title: scriptData.subject,
        content: scriptData.content,
        type: scriptData.type
      })
      .eq("id", editingCampaign.script_id);

    if (scriptError) throw scriptError;

    const { error: campaignError } = await supabase
      .from("campaigns")
      .update({
        title: campaignData.title,
        description: campaignData.description,
        scheduled_at: campaignData.scheduled_at,
        type: campaignData.type,
      })
      .eq("id", editingCampaign.id);

    if (campaignError) throw campaignError;

    toast({
      title: "Campaign updated",
      description: "Your campaign has been updated successfully."
    });
  };

  const createCampaign = async (
    campaignData: {
      title: string;
      description: string;
      scheduled_at?: string;
      type: string;
    },
    scriptData: {
      subject: string;
      content: string;
      type: string;
    }
  ) => {
    const script = await saveScript(
      "", // campaign ID will be set after campaign creation
      scriptData.type,
      scriptData.subject,
      scriptData.content
    );

    const { error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        title: campaignData.title,
        description: campaignData.description,
        status: "draft",
        schedule_status: "draft",
        type: campaignData.type,
        script_id: script.id,
        scheduled_at: campaignData.scheduled_at,
      })
      .select();

    if (campaignError) throw campaignError;

    toast({
      title: "Campaign created",
      description: "Your campaign has been created successfully."
    });
  };

  const handleSave = async (
    formData: {
      campaignName: string;
      description: string;
      scheduledDate?: Date;
      messageType: string;
      subject: string;
      content: string;
    }
  ) => {
    try {
      const campaignData = {
        title: formData.campaignName,
        description: formData.description,
        scheduled_at: formData.scheduledDate?.toISOString(),
        type: formData.messageType,
      };

      const scriptData = {
        subject: formData.subject,
        content: formData.content,
        type: formData.messageType,
      };

      if (editingCampaign) {
        await updateCampaign(campaignData, scriptData);
      } else {
        await createCampaign(campaignData, scriptData);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save campaign."
      });
    }
  };

  return {
    handleSave,
  };
};

