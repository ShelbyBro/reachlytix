
import twilio from "https://esm.sh/twilio@4.19.3";

export const initTwilioClient = (customCredentials?: any) => {
  // Use custom credentials if provided (for testing purposes), otherwise use environment variables
  const accountSid = customCredentials?.accountSid || Deno.env.get('TWILIO_ACCOUNT_SID') || '';
  const authToken = customCredentials?.authToken || Deno.env.get('TWILIO_AUTH_TOKEN') || '';
  const twilioPhoneNumber = customCredentials?.phoneNumber || Deno.env.get('TWILIO_PHONE_NUMBER') || '';
  
  // Log which credentials we're using (without exposing sensitive data)
  console.log("Twilio configuration:");
  console.log("- Using account SID:", accountSid ? `${accountSid.substring(0, 5)}...` : "Not provided");
  console.log("- Auth token provided:", authToken ? "Yes" : "No");
  console.log("- Phone number:", twilioPhoneNumber || "Not provided");
  
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.log("⚠️ Missing one or more Twilio environment variables");
    throw new Error("Missing Twilio credentials: Please ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set.");
  }
  
  try {
    const client = twilio(accountSid, authToken);
    
    return {
      client,
      phoneNumber: twilioPhoneNumber
    };
  } catch (error) {
    console.error("Error initializing Twilio client:", error);
    throw new Error("Failed to initialize Twilio client: " + error.message);
  }
};
