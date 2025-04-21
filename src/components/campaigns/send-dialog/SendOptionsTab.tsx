
import { SendOptionsSelector } from "../SendOptionsSelector";

interface SendOptionsTabProps {
  sendMode: "now" | "schedule";
  onSendModeChange: (mode: "now" | "schedule") => void;
  scheduledDate: Date | undefined;
  onScheduledDateChange: (date: Date | undefined) => void;
  scheduledTime: string;
  onScheduledTimeChange: (time: string) => void;
}

export function SendOptionsTab({
  sendMode,
  onSendModeChange,
  scheduledDate,
  onScheduledDateChange,
  scheduledTime,
  onScheduledTimeChange
}: SendOptionsTabProps) {
  return (
    <SendOptionsSelector
      sendMode={sendMode}
      onSendModeChange={onSendModeChange}
      scheduledDate={scheduledDate}
      onScheduledDateChange={onScheduledDateChange}
      scheduledTime={scheduledTime}
      onScheduledTimeChange={onScheduledTimeChange}
    />
  );
}
