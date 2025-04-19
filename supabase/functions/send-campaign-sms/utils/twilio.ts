
import twilio from "https://esm.sh/twilio@4.19.3";

export const initTwilioClient = () => {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '';
  
  return {
    client: twilio(accountSid, authToken),
    phoneNumber: twilioPhoneNumber
  };
};

