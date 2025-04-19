
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TwilioService } from "./twilio-service.ts";
import { updateCampaignStatus } from "../utils/campaign.ts";

interface CampaignResult {
  success: boolean;
  totalSent: number;
  totalFailed: number;
  messages: any[];
}

export class CampaignService {
  private supabase: ReturnType<typeof createClient>;
  private twilioService: TwilioService;

  constructor(supabase: ReturnType<typeof createClient>, twilioCredentials?: any) {
    this.supabase = supabase;
    this.twilioService = new TwilioService(supabase, twilioCredentials);
  }

  async sendTestMessage(
    campaignId: string,
    testPhone: string,
    content: string
  ): Promise<CampaignResult> {
    console.log(`Sending test message to ${testPhone}`);

    const result = await this.twilioService.sendMessage(
      campaignId,
      null,
      testPhone,
      content
    );

    return {
      success: result.success,
      totalSent: result.success ? 1 : 0,
      totalFailed: result.success ? 0 : 1,
      messages: [{
        phone: testPhone,
        status: result.success ? 'sent' : 'failed',
        sid: result.sid,
        error: result.error
      }]
    };
  }

  async sendCampaign(
    campaignId: string,
    leads: any[],
    content: string
  ): Promise<CampaignResult> {
    const results = {
      success: 0,
      failed: 0,
      messages: [] as any[]
    };

    for (const lead of leads) {
      if (!lead.phone) {
        console.log(`Skipping lead ${lead.id}: No phone number`);
        results.failed++;
        results.messages.push({
          leadId: lead.id,
          status: 'failed',
          error: 'No phone number provided'
        });
        continue;
      }

      const sendResult = await this.twilioService.sendMessage(
        campaignId,
        lead.id,
        lead.phone,
        content
      );

      if (sendResult.success) {
        results.success++;
        results.messages.push({
          leadId: lead.id,
          phone: lead.phone,
          status: 'sent',
          sid: sendResult.sid
        });
      } else {
        results.failed++;
        results.messages.push({
          leadId: lead.id,
          phone: lead.phone,
          status: 'failed',
          error: sendResult.error
        });
      }
    }

    // Update campaign status
    await updateCampaignStatus(this.supabase, campaignId, results.failed > 0);

    return {
      success: results.success > 0,
      totalSent: results.success,
      totalFailed: results.failed,
      messages: results.messages
    };
  }
}
