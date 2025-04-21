
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SimpleCampaign, SimpleLead, SimpleScript } from "@/types/campaign";
import { sendCampaignEmails, sendCampaignSMS } from "@/utils/campaign-utils";
import { supabase } from "@/integrations/supabase/client";

export const useSendCampaign = (
  campaign: SimpleCampaign | null,
  leads: SimpleLead[],
  script: SimpleScript | null,
  onSendSuccess: () => void,
  onClose: () => void
) => {
  const { toast } = useToast();
  const [sendingCampaign, setSendingCampaign] = useState(false);
  
  const handleSendCampaign = async (
    messageType: "email" | "sms" | "whatsapp",
    sendMode: "now" | "schedule",
    scheduledDate?: Date,
    scheduledTime?: string
  ) => {
    if (!campaign) return;
    
    if (!leads.length) {
      toast({
        variant: "destructive",
        title: "No leads",
        description: "This campaign doesn't have any leads to send to."
      });
      return;
    }
    
    if (!script) {
      toast({
        variant: "destructive",
        title: "No content",
        description: `This campaign doesn't have any ${messageType} content.`
      });
      return;
    }

    if (sendMode === "schedule" && !scheduledDate) {
      toast({
        variant: "destructive",
        title: "Missing schedule",
        description: "Please select a date to schedule this campaign."
      });
      return;
    }

    setSendingCampaign(true);
    
    try {
      if (sendMode === "schedule") {
        const scheduledDateTime = new Date(scheduledDate!);
        const [hours, minutes] = scheduledTime!.split(':').map(Number);
        scheduledDateTime.setHours(hours, minutes);

        const { error: scheduleError } = await supabase
          .from("campaigns")
          .update({
            scheduled_at: scheduledDateTime.toISOString(),
            schedule_status: "scheduled"
          })
          .eq("id", campaign.id);

        if (scheduleError) throw scheduleError;

        toast({
          title: "Campaign Scheduled",
          description: `Campaign scheduled for ${scheduledDate?.toLocaleDateString()} at ${scheduledTime}`
        });

        onSendSuccess();
        onClose();
        return;
      }
      
      let result;
      
      if (messageType === "email") {
        result = await sendCampaignEmails(
          campaign.id, 
          campaign.title, 
          script.title,
          script.content,
          leads
        );
      } else if (messageType === "sms" || messageType === "whatsapp") {
        result = await sendCampaignSMS(
          campaign.id,
          campaign.title,
          script.content,
          leads,
          messageType
        );
      }
      
      if (!result) {
        throw new Error(`Failed to send ${messageType} campaign`);
      }
      
      toast({
        variant: result.success ? "default" : "destructive",
        title: result.success ? "Success" : "Error",
        description: result.message
      });
      
      if (result.success) {
        onSendSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error(`Error sending ${messageType} campaign:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to send ${messageType} campaign.`
      });
    } finally {
      setSendingCampaign(false);
    }
  };

  const handleStartAICampaign = async () => {
    if (!campaign) return;
    
    setSendingCampaign(true);
    
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ 
          status: "running",
          started_at: new Date().toISOString()
        })
        .eq("id", campaign.id);
      
      if (error) throw error;
      
      toast({
        title: "AI Campaign Started",
        description: `Campaign "${campaign.title}" has been activated and will begin processing leads.`
      });
      
      onSendSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error starting AI campaign:", error);
      toast({
        variant: "destructive",
        title: "Start Campaign Failed",
        description: error.message || "Failed to start the AI campaign. Please try again."
      });
    } finally {
      setSendingCampaign(false);
    }
  };

  return { sendingCampaign, handleSendCampaign, handleStartAICampaign };
};
