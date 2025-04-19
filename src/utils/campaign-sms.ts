
import { supabase } from "@/integrations/supabase/client";
import { logCampaignSend } from "./campaign-logging";

export const sendCampaignSMS = async (
  campaignId: string,
  campaignTitle: string,
  content: string,
  leads: any[],
  messageType: string = "sms",
  isTest: boolean = false,
  testPhone?: string
): Promise<{ success: boolean; message: string; results?: any }> => {
  try {
    console.log(`Initializing ${messageType} campaign "${campaignTitle}" to ${leads.length} leads`);
    
    const payload = {
      campaignId,
      leads: isTest ? [] : leads,
      content,
      isTest,
      testPhone
    };
    
    // Call the edge function to send the SMS messages
    const { data, error } = await supabase.functions.invoke('send-campaign-sms', {
      body: payload
    });
    
    if (error) throw error;
    
    if (!isTest) {
      // Log the campaign send
      await logCampaignSend({
        campaign_id: campaignId,
        total_recipients: leads.length,
        delivery_status: data.results.totalFailed > 0 ? "partial" : "sent",
        message_type: messageType
      });
    }
    
    return {
      success: true,
      message: isTest
        ? `Test ${messageType} sent successfully!`
        : `${messageType.toUpperCase()} campaign sent to ${data.results.totalSent} leads successfully!${
            data.results.totalFailed > 0 ? ` (${data.results.totalFailed} failed)` : ''
          }`,
      results: data.results
    };
  } catch (error: any) {
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
  }
};
