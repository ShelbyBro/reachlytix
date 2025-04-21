
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SimpleCampaign, SimpleLead, SimpleScript } from "@/types/campaign";
import { sendCampaignEmails, sendCampaignSMS } from "@/utils/campaign-utils";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, MessageSquare, CalendarCheck, Bot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageTypeSelector } from "./MessageTypeSelector";
import { SendOptionsSelector } from "./SendOptionsSelector";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SendCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: SimpleCampaign | null;
  leads: SimpleLead[];
  script: SimpleScript | null;
  onSendSuccess: () => void;
}

export function SendCampaignDialog({
  isOpen,
  onClose,
  campaign,
  leads,
  script,
  onSendSuccess
}: SendCampaignDialogProps) {
  const { toast } = useToast();
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [messageType, setMessageType] = useState<"email" | "sms" | "whatsapp" | "ai">("email");
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");

  const handleSendCampaign = async () => {
    if (!campaign) return;
    
    const campaignId = campaign.id;
    
    if (!leads.length) {
      toast({
        variant: "destructive",
        title: "No leads",
        description: "This campaign doesn't have any leads to send to."
      });
      return;
    }
    
    if (!script && messageType !== "ai") {
      toast({
        variant: "destructive",
        title: "No content",
        description: "This campaign doesn't have any email content."
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
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        scheduledDateTime.setHours(hours, minutes);

        const { error: scheduleError } = await supabase
          .from("campaigns")
          .update({
            scheduled_at: scheduledDateTime.toISOString(),
            schedule_status: "scheduled"
          })
          .eq("id", campaignId);

        if (scheduleError) throw scheduleError;

        toast({
          title: "Campaign Scheduled",
          description: `Campaign scheduled for ${format(scheduledDateTime, "PPP")} at ${scheduledTime}`
        });

        onSendSuccess();
        onClose();
        return;
      }
      
      if (messageType === "ai") {
        console.log("🔥 AI Campaign Triggered", campaign?.id); // debug log

        try {
          const { error } = await supabase
            .from("campaigns")
            .update({
              status: "running",
              started_at: new Date().toISOString()
            })
            .eq("id", campaign.id);

          if (error) {
            console.error("🔥 Supabase Error:", error); // debug log
            throw error;
          }

          toast({
            title: "AI Agent Campaign Started",
            description: `${campaign.title} is now running with the AI agent.`,
          });

          onSendSuccess();
          onClose();
          return;
        } catch (err: any) {
          toast({
            variant: "destructive",
            title: "Failed to Start AI Campaign",
            description: err.message || "An unknown error occurred.",
          });
          setSendingCampaign(false);
          return;
        }
      }

      let result;
      
      if (messageType === "email") {
        result = await sendCampaignEmails(
          campaignId, 
          campaign.title, 
          script?.title || "No Subject",
          script?.content || "",
          leads
        );
      } else {
        result = await sendCampaignSMS(
          campaignId,
          campaign.title,
          script?.content || "Thank you for joining Reachlytix. Stay tuned for offers!",
          leads,
          messageType
        );
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
      console.error("Error sending campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send campaign."
      });
    } finally {
      setSendingCampaign(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Campaign</DialogTitle>
          <DialogDescription>
            {campaign && (
              `You're about to send "${campaign.title}" to ${leads.length} leads.`
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="messageType" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="messageType">Message Type</TabsTrigger>
            <TabsTrigger value="sendOptions">Send Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="messageType">
            <MessageTypeSelector
              messageType={messageType}
              onMessageTypeChange={(type) => setMessageType(type)}
              campaignId={campaign?.id || ""}
              script={script}
            />
          </TabsContent>
          
          <TabsContent value="sendOptions">
            <SendOptionsSelector
              sendMode={sendMode}
              onSendModeChange={setSendMode}
              scheduledDate={scheduledDate}
              onScheduledDateChange={setScheduledDate}
              scheduledTime={scheduledTime}
              onScheduledTimeChange={setScheduledTime}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={sendingCampaign}
            onClick={handleSendCampaign}
            className="gap-2"
          >
            {sendingCampaign ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {sendMode === "schedule" ? "Scheduling..." : "Sending..."}
              </>
            ) : (
              <>
                {sendMode === "schedule" ? (
                  <>
                    <CalendarCheck className="h-4 w-4" />
                    Schedule
                  </>
                ) : (
                  <>
                    {messageType === "email" ? (
                      <>
                        <Mail className="h-4 w-4" />
                        Send Email
                      </>
                    ) : messageType === "sms" ? (
                      <>
                        <MessageSquare className="h-4 w-4" />
                        Send SMS Now
                      </>
                    ) : messageType === "whatsapp" ? (
                      <>
                        <MessageSquare className="h-4 w-4" />
                        Send WhatsApp
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        Start AI Campaign
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
