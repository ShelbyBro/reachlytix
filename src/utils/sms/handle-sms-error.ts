
import { logCampaignSend } from "../campaign-logging";

export const handleSmsError = async (
  error: any,
  campaignId: string,
  leads: any[],
  messageType: string,
  isTest: boolean
) => {
  console.error(`Error sending ${messageType} campaign:`, error);
  
  // Try to extract detailed error information
  let errorMessage = error.message || `Failed to send ${messageType} campaign`;
  let errorDetails = '';
  
  // Check if this is an error from the edge function with details
  if (error.data && error.data.error) {
    errorMessage = error.data.error;
    if (error.data.details) {
      errorDetails = error.data.details;
    }
  }
  
  // Look for Twilio-specific errors in the message
  if (errorMessage.includes('Twilio') || 
      errorMessage.toLowerCase().includes('phone') || 
      errorMessage.includes('SMS')) {
    
    // Common Twilio error patterns we can make more user-friendly
    if (errorMessage.includes('not a valid phone number')) {
      errorMessage = 'Invalid phone number format. Numbers must include country code (e.g. +1 for US).';
    } else if (errorMessage.includes('is not a mobile number')) {
      errorMessage = 'The phone number is not a mobile number and cannot receive SMS.';
    } else if (errorMessage.includes('permission to send')) {
      errorMessage = 'The Twilio account does not have permission to send to this number. Check if it\'s verified in your Twilio console.';
    } else if (errorMessage.includes('not a valid')) {
      errorMessage = 'Invalid Twilio credentials or phone number format.';
    }
  }
  
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
    message: errorMessage,
    details: errorDetails
  };
};
