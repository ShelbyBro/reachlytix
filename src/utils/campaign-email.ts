
import { logCampaignSend } from "./campaign-logging";
import { updateCampaignStatus } from "./campaign-logging";

export const sendCampaignEmails = async (
  campaignId: string, 
  campaignTitle: string,
  subject: string,
  content: string,
  leads: any[]
): Promise<{ success: boolean; message: string }> => {
  try {
    // For demo purposes, we'll simulate sending the emails
    console.log(`Sending campaign "${campaignTitle}" to ${leads.length} leads`);
    console.log("Subject:", subject);
    console.log("Content:", content);
    
    // In a real implementation, this would call Resend API or another email service
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Log the campaign send
    await logCampaignSend({
      campaign_id: campaignId,
      total_recipients: leads.length,
      delivery_status: "sent",
      message_type: "email"
    });
    
    // Update campaign status to sent
    await updateCampaignStatus(campaignId, "sent");
    
    return {
      success: true,
      message: `Campaign sent to ${leads.length} leads successfully!`
    };
  } catch (error: any) {
    console.error("Error sending campaign:", error);
    
    // Log the failed attempt
    await logCampaignSend({
      campaign_id: campaignId,
      total_recipients: leads.length,
      delivery_status: "failed",
      message_type: "email"
    });
    
    return {
      success: false,
      message: error.message || "Failed to send campaign"
    };
  }
};
