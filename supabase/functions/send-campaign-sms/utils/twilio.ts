
import twilio from "https://esm.sh/twilio@4.19.3";

export const initTwilioClient = (customCredentials?: any) => {
  // Use custom credentials if provided (for testing purposes), otherwise use environment variables
  const accountSid = customCredentials?.accountSid || Deno.env.get('TWILIO_ACCOUNT_SID') || '';
  const authToken = customCredentials?.authToken || Deno.env.get('TWILIO_AUTH_TOKEN') || '';
  const twilioPhoneNumber = customCredentials?.phoneNumber || Deno.env.get('TWILIO_PHONE_NUMBER') || '';
  
  // Enhanced logging
  console.log("Initializing Twilio client:");
  console.log("- Using account SID:", accountSid ? `${accountSid.substring(0, 5)}...` : "Not provided");
  console.log("- Auth token provided:", authToken ? "Yes" : "No");
  console.log("- Phone number:", twilioPhoneNumber || "Not provided");
  
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    const missingVars = [];
    if (!accountSid) missingVars.push("TWILIO_ACCOUNT_SID");
    if (!authToken) missingVars.push("TWILIO_AUTH_TOKEN");
    if (!twilioPhoneNumber) missingVars.push("TWILIO_PHONE_NUMBER");
    
    const errorMsg = `Missing Twilio credentials: ${missingVars.join(", ")}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  try {
    const client = twilio(accountSid, authToken);
    return {
      client,
      phoneNumber: twilioPhoneNumber
    };
  } catch (error) {
    console.error("Error initializing Twilio client:", error);
    throw new Error(`Failed to initialize Twilio client: ${error.message}`);
  }
};
