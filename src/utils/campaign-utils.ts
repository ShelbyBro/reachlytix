
import { supabase } from "@/integrations/supabase/client";

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

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
      .update({ status })
      .eq('id', campaignId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating campaign status:", error);
    throw error;
  }
};

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

export const sendCampaignSMS = async (
  campaignId: string,
  campaignTitle: string,
  content: string,
  leads: any[]
): Promise<{ success: boolean; message: string }> => {
  try {
    // For demo purposes, we'll simulate sending SMS
    console.log(`Sending SMS campaign "${campaignTitle}" to ${leads.length} leads`);
    console.log("Content:", content);
    
    // Simulate successful sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Log the campaign send
    await logCampaignSend({
      campaign_id: campaignId,
      total_recipients: leads.length,
      delivery_status: "sent",
      message_type: "sms"
    });
    
    // Update campaign status to sent
    await updateCampaignStatus(campaignId, "sent");
    
    return {
      success: true,
      message: `SMS campaign sent to ${leads.length} leads successfully!`
    };
  } catch (error: any) {
    console.error("Error sending SMS campaign:", error);
    
    // Log the failed attempt
    await logCampaignSend({
      campaign_id: campaignId,
      total_recipients: leads.length,
      delivery_status: "failed",
      message_type: "sms"
    });
    
    return {
      success: false,
      message: error.message || "Failed to send SMS campaign"
    };
  }
};
