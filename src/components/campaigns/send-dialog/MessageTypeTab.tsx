
import { MessageTypeSelector } from "../MessageTypeSelector";
import { SimpleScript } from "@/types/campaign";

interface MessageTypeTabProps {
  messageType: "email" | "sms" | "whatsapp" | "ai";
  onMessageTypeChange: (type: "email" | "sms" | "whatsapp" | "ai") => void;
  campaignId: string;
  script: SimpleScript | null;
}

export function MessageTypeTab({ 
  messageType, 
  onMessageTypeChange, 
  campaignId, 
  script 
}: MessageTypeTabProps) {
  return (
    <MessageTypeSelector
      messageType={messageType}
      onMessageTypeChange={onMessageTypeChange}
      campaignId={campaignId}
      script={script}
    />
  );
}
