
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SimpleCampaign } from "@/types/campaign";

export const useCampaignUpdate = (campaignId: string, onSuccess: () => void) => {
  const { toast } = useToast();

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
    if (!campaignId) return;

    const { error: scriptError } = await supabase
      .from("scripts")
      .update({
        title: scriptData.subject,
        content: scriptData.content,
        type: scriptData.type
      })
      .eq("id", campaignId);

    if (scriptError) throw scriptError;

    const { error: campaignError } = await supabase
      .from("campaigns")
      .update({
        title: campaignData.title,
        description: campaignData.description,
        scheduled_at: campaignData.scheduled_at,
        type: campaignData.type,
      })
      .eq("id", campaignId);

    if (campaignError) throw campaignError;

    toast({
      title: "Campaign updated",
      description: "Your campaign has been updated successfully."
    });

    onSuccess();
  };

  return { updateCampaign };
};
