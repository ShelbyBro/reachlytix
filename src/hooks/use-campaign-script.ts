
import { supabase } from "@/integrations/supabase/client";

export const useCampaignScript = () => {
  const fetchScript = async (scriptId: string) => {
    const { data: script, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", scriptId)
      .single();

    if (error) {
      console.error("Error fetching script:", error);
      return null;
    }

    return script;
  };

  const saveScript = async (
    campaignId: string,
    messageType: string,
    subject: string,
    content: string
  ) => {
    const { data, error } = await supabase
      .from("scripts")
      .insert({
        title: subject || messageType === "email" ? subject : `${messageType} Message`,
        content: content,
        type: messageType,
        campaign_id: campaignId,
      })
      .select();

    if (error) throw error;
    return data[0];
  };

  return {
    fetchScript,
    saveScript,
  };
};

