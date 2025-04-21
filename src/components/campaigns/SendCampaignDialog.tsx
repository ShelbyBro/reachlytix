
import React, { useState } from "react";
import { SimpleCampaign, SimpleLead, SimpleScript } from "@/types/campaign";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogActions } from "./send-dialog/DialogActions";
import { MessageTypeTab } from "./send-dialog/MessageTypeTab";
import { SendOptionsTab } from "./send-dialog/SendOptionsTab";
import { useSendCampaign } from "./send-dialog/useSendCampaign";

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
  const [messageType, setMessageType] = useState<"email" | "sms" | "whatsapp" | "ai">("email");
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");

  const { sendingCampaign, handleSendCampaign, handleStartAICampaign } = useSendCampaign(
    campaign,
    leads,
    script,
    onSendSuccess,
    onClose
  );

  const handleCampaignAction = () => {
    if (messageType === "ai") {
      handleStartAICampaign();
    } else {
      handleSendCampaign(messageType, sendMode, scheduledDate, scheduledTime);
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
            <MessageTypeTab
              messageType={messageType}
              onMessageTypeChange={setMessageType}
              campaignId={campaign?.id || ""}
              script={script}
            />
          </TabsContent>
          
          <TabsContent value="sendOptions">
            <SendOptionsTab
              sendMode={sendMode}
              onSendModeChange={setSendMode}
              scheduledDate={scheduledDate}
              onScheduledDateChange={setScheduledDate}
              scheduledTime={scheduledTime}
              onScheduledTimeChange={setScheduledTime}
            />
          </TabsContent>
        </Tabs>

        <DialogActions
          onClose={onClose}
          onSend={handleCampaignAction}
          sendingCampaign={sendingCampaign}
          sendMode={sendMode}
          messageType={messageType}
        />
      </DialogContent>
    </Dialog>
  );
}
