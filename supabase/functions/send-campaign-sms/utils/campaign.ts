
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const updateCampaignStatus = async (
  supabase: ReturnType<typeof createClient>,
  campaignId: string,
  hasErrors: boolean
): Promise<void> => {
  await supabase
    .from('campaigns')
    .update({ 
      status: 'sent',
      schedule_status: hasErrors ? 'completed_with_errors' : 'completed' 
    })
    .eq('id', campaignId);
};

