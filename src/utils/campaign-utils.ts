
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

// Analytics mock data generators
export const generateMockAnalytics = (startDate: Date, endDate: Date, messageType: string = 'email') => {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const dataPoints = Math.min(days, 30); // Cap at 30 data points to avoid overcrowding
  
  const emailsOverTime = [];
  let totalSent = 0;
  let totalDelivered = 0;
  let totalOpened = 0;
  let totalClicked = 0;
  
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(i * days / dataPoints));
    
    const sentCount = Math.floor(Math.random() * 50) + 10;
    const deliveredCount = Math.floor(sentCount * (0.9 + Math.random() * 0.1));
    const openedCount = Math.floor(deliveredCount * (0.3 + Math.random() * 0.4));
    const clickedCount = Math.floor(openedCount * (0.1 + Math.random() * 0.3));
    
    emailsOverTime.push({
      date: date.toISOString().split('T')[0],
      sent: sentCount,
      delivered: deliveredCount,
      opened: openedCount,
      clicked: clickedCount,
      type: messageType
    });
    
    totalSent += sentCount;
    totalDelivered += deliveredCount;
    totalOpened += openedCount;
    totalClicked += clickedCount;
  }
  
  return {
    overTime: emailsOverTime,
    totals: {
      sent: totalSent,
      delivered: totalDelivered,
      failed: totalSent - totalDelivered,
      opened: totalOpened,
      clicked: totalClicked,
      openRate: totalOpened / totalDelivered,
      clickRate: totalClicked / totalDelivered,
      conversionRate: totalClicked * 0.15 / totalDelivered, // Assuming 15% of clicks convert
    }
  };
};
