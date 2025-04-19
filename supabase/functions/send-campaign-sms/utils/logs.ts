
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface LogData {
  campaignId: string;
  leadId: string | null;
  phone: string;
  message: string;
  status: string;
  sid?: string;
  error?: string;
}

export const logSmsMessage = async (
  supabase: ReturnType<typeof createClient>,
  data: LogData
): Promise<void> => {
  try {
    const { error: insertError } = await supabase
      .from('sms_logs')
      .insert({
        campaign_id: data.campaignId,
        lead_id: data.leadId,
        phone: data.phone,
        message: data.message,
        status: data.status,
        sid: data.sid,
        error: data.error
      });
    
    if (insertError) {
      console.error('Error logging SMS:', insertError);
    }
  } catch (err) {
    console.error('Failed to log SMS:', err);
  }
};

