
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Bot } from "lucide-react";

interface RadioOptionsProps {
  messageType: "email" | "sms" | "whatsapp" | "ai";
  onMessageTypeChange: (type: "email" | "sms" | "whatsapp" | "ai") => void;
}

export function RadioOptions({ messageType, onMessageTypeChange }: RadioOptionsProps) {
  return (
    <RadioGroup 
      value={messageType} 
      onValueChange={(val) => onMessageTypeChange(val as "email" | "sms" | "whatsapp" | "ai")}
      className="flex flex-col space-y-3"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="email" id="email" />
        <Label htmlFor="email" className="flex items-center">
          <Mail className="w-4 h-4 mr-2" /> Email
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="sms" id="sms" />
        <Label htmlFor="sms" className="flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" /> SMS
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="whatsapp" id="whatsapp" />
        <Label htmlFor="whatsapp" className="flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="ai" id="ai" />
        <Label htmlFor="ai" className="flex items-center">
          <Bot className="w-4 h-4 mr-2" /> AI Agent
        </Label>
      </div>
    </RadioGroup>
  );
}
