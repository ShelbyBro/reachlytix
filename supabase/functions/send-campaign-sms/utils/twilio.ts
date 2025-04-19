
import twilio from "https://esm.sh/twilio@4.19.3";

export const initTwilioClient = () => {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '';
  
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.log("⚠️ Missing one or more Twilio environment variables");
  }
  
  try {
    console.log("Initializing Twilio client with account SID:", accountSid ? `${accountSid.substring(0, 5)}...` : "Not provided");
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
