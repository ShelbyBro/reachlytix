
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SendIcon, CalendarCheck } from "lucide-react";

interface SendModeRadioProps {
  sendMode: "now" | "schedule";
  onSendModeChange: (mode: "now" | "schedule") => void;
}

export function SendModeRadio({ sendMode, onSendModeChange }: SendModeRadioProps) {
  return (
    <RadioGroup 
      value={sendMode} 
      onValueChange={(val) => onSendModeChange(val as "now" | "schedule")}
      className="flex flex-col space-y-3"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="now" id="now" />
        <Label htmlFor="now" className="flex items-center">
          <SendIcon className="w-4 h-4 mr-2" /> Send Now
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="schedule" id="schedule" />
        <Label htmlFor="schedule" className="flex items-center">
          <CalendarCheck className="w-4 h-4 mr-2" /> Schedule Send
        </Label>
      </div>
    </RadioGroup>
  );
}
