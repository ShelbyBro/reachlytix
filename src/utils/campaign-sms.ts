
import { supabase } from "@/integrations/supabase/client";
import { logCampaignSend } from "./campaign-logging";
import { handleSmsError } from "./sms/handle-sms-error";
import { sanitizePhoneNumber } from "./sms/format-phone";

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
    
    // Sanitize test phone if provided
    const sanitizedTestPhone = testPhone ? sanitizePhoneNumber(testPhone) : undefined;
    
    const payload = {
      campaignId,
      leads: isTest ? [] : leads.map(lead => ({
        ...lead,
        phone: sanitizePhoneNumber(lead.phone)
      })),
      content,
      isTest,
      testPhone: sanitizedTestPhone,
      messageType
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
    return handleSmsError(error, campaignId, leads, messageType, isTest);
  }
};
