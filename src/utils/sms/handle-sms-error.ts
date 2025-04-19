
import { logCampaignSend } from "../campaign-logging";

export const handleSmsError = async (
  error: any,
  campaignId: string,
  leads: any[],
  messageType: string,
  isTest: boolean
) => {
  console.error(`Error sending ${messageType} campaign:`, error);
  
  if (!isTest) {
    // Log the failed attempt
    await logCampaignSend({
      campaign_id: campaignId,
      total_recipients: leads.length,
      delivery_status: "failed",
      message_type: messageType
    });
  }
  
  return {
    success: false,
    message: error.message || `Failed to send ${messageType} campaign`
  };
};
