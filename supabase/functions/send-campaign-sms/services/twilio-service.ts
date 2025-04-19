
import { initTwilioClient } from "../utils/twilio.ts";
import { sanitizePhoneNumber } from "../utils/phone.ts";
import { logSmsMessage } from "../utils/logs.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SendMessageResult {
  success: boolean;
  sid?: string;
  error?: string;
}

export class TwilioService {
  private twilioClient;
  private twilioPhoneNumber: string;
  private supabase: ReturnType<typeof createClient>;
  
  constructor(supabase: ReturnType<typeof createClient>, twilioCredentials?: any) {
    this.supabase = supabase;
    const config = initTwilioClient(twilioCredentials);
    this.twilioClient = config.client;
    this.twilioPhoneNumber = config.phoneNumber;
  }

  async sendMessage(
    campaignId: string,
    leadId: string | null,
    phone: string,
    content: string
  ): Promise<SendMessageResult> {
    try {
      const sanitizedPhone = sanitizePhoneNumber(phone);
      
      if (!sanitizedPhone || !sanitizedPhone.startsWith('+')) {
        throw new Error(`Invalid phone number format: ${sanitizedPhone}. Must start with + and country code.`);
      }

      console.log(`Sending message to ${sanitizedPhone} using Twilio number ${this.twilioPhoneNumber}`);
      
      const message = await this.twilioClient.messages.create({
        body: content,
        from: this.twilioPhoneNumber,
        to: sanitizedPhone
      });

      console.log(`Message sent successfully with SID: ${message.sid}`);

      await logSmsMessage(this.supabase, {
        campaignId,
        leadId,
        phone: sanitizedPhone,
        message: content,
        status: 'sent',
        sid: message.sid
      });

      return {
        success: true,
        sid: message.sid
      };
    } catch (error: any) {
      console.error(`Failed to send message via Twilio:`, error);

      await logSmsMessage(this.supabase, {
        campaignId,
        leadId,
        phone,
        message: content,
        status: 'failed',
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }
}
