
import { SendModeRadio } from "./send-dialog/send-options/SendModeRadio";
import { ScheduleFields } from "./send-dialog/send-options/ScheduleFields";

interface SendOptionsSelectorProps {
  sendMode: "now" | "schedule";
  onSendModeChange: (mode: "now" | "schedule") => void;
  scheduledDate: Date | undefined;
  onScheduledDateChange: (date: Date | undefined) => void;
  scheduledTime: string;
  onScheduledTimeChange: (time: string) => void;
}

export function SendOptionsSelector({
  sendMode,
  onSendModeChange,
  scheduledDate,
  onScheduledDateChange,
  scheduledTime,
  onScheduledTimeChange
}: SendOptionsSelectorProps) {
  return (
    <div className="space-y-4">
      <SendModeRadio sendMode={sendMode} onSendModeChange={onSendModeChange} />
      
      {sendMode === "schedule" && (
        <ScheduleFields
          scheduledDate={scheduledDate}
          onScheduledDateChange={onScheduledDateChange}
          scheduledTime={scheduledTime}
          onScheduledTimeChange={onScheduledTimeChange}
        />
      )}
    </div>
  );
}
