
import { supabase } from "@/integrations/supabase/client";

export interface CampaignLog {
  campaign_id: string;
  total_recipients: number;
  delivery_status: string;
  message_type: string;
}

export const logCampaignSend = async (log: CampaignLog): Promise<void> => {
  try {
    const { error } = await supabase
      .from('campaign_logs')
      .insert({
        campaign_id: log.campaign_id,
        total_recipients: log.total_recipients,
        delivery_status: log.delivery_status,
        message_type: log.message_type,
      });

    if (error) throw error;
  } catch (error) {
    console.error("Error logging campaign send:", error);
    throw error;
  }
};

export const updateCampaignStatus = async (campaignId: string, status: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('campaigns')
      .update({ 
        status, 
        schedule_status: status === 'sent' ? 'completed' : 'failed'
      })
      .eq('id', campaignId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating campaign status:", error);
    throw error;
  }
};
