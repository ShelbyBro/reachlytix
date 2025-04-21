
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2, Mail, MessageSquare, CalendarCheck, Bot } from "lucide-react";

interface DialogActionsProps {
  onClose: () => void;
  onSend: () => void;
  sendingCampaign: boolean;
  sendMode: "now" | "schedule";
  messageType: "email" | "sms" | "whatsapp" | "ai";
}

export function DialogActions({
  onClose,
  onSend,
  sendingCampaign,
  sendMode,
  messageType
}: DialogActionsProps) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onClose} disabled={sendingCampaign}>
        Cancel
      </Button>
      <Button
        disabled={sendingCampaign}
        onClick={onSend}
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
                    Send SMS
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
  );
}
