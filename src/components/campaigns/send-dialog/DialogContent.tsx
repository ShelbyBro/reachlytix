
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageTypeTab } from "./MessageTypeTab";
import { SendOptionsTab } from "./SendOptionsTab";
import { SimpleCampaign, SimpleLead, SimpleScript } from "@/types/campaign";

interface DialogContentProps {
  campaign: SimpleCampaign | null;
  leads: SimpleLead[];
  messageType: "email" | "sms" | "whatsapp" | "ai";
  setMessageType: (type: "email" | "sms" | "whatsapp" | "ai") => void;
  sendMode: "now" | "schedule";
  setSendMode: (mode: "now" | "schedule") => void;
  scheduledDate: Date | undefined;
  setScheduledDate: (date: Date | undefined) => void;
  scheduledTime: string;
  setScheduledTime: (time: string) => void;
  script: SimpleScript | null;
}

export function DialogContent({
  campaign,
  leads,
  messageType,
  setMessageType,
  sendMode,
  setSendMode,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  script
}: DialogContentProps) {
  return (
    <>
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
    </>
  );
}
