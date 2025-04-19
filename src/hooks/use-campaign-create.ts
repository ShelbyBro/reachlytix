
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCampaignScript } from "./use-campaign-script";

export const useCampaignCreate = (onSuccess: () => void) => {
  const { toast } = useToast();
  const { saveScript } = useCampaignScript();

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

    onSuccess();
  };

  return { createCampaign };
};
