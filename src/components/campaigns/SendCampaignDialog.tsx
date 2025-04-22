
import React, { useState } from "react";
import { Dialog, DialogContent as UIDialogContent } from "@/components/ui/dialog";
import { DialogContent } from "./send-dialog/DialogContent";
import { DialogActions } from "./send-dialog/DialogActions";
import { SimpleCampaign, SimpleLead, SimpleScript } from "@/types/campaign";
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

  const { 
    sendingCampaign,
    handleSendCampaign,
    handleStartAICampaign
  } = useSendCampaign(campaign, leads, script, onSendSuccess, onClose);

  const handleSend = async () => {
    if (messageType === "ai") {
      await handleStartAICampaign();
    } else {
      await handleSendCampaign(messageType, sendMode, scheduledDate, scheduledTime);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <UIDialogContent className="max-w-md">
        <DialogContent
          campaign={campaign}
          leads={leads}
          messageType={messageType}
          setMessageType={setMessageType}
          sendMode={sendMode}
          setSendMode={setSendMode}
          scheduledDate={scheduledDate}
          setScheduledDate={setScheduledDate}
          scheduledTime={scheduledTime}
          setScheduledTime={setScheduledTime}
          script={script}
        />
        
        <DialogActions
          onClose={onClose}
          onSend={handleSend}
          sendingCampaign={sendingCampaign}
          sendMode={sendMode}
          messageType={messageType}
        />
      </UIDialogContent>
    </Dialog>
  );
}
