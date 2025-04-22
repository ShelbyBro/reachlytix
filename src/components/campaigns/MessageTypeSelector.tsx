
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTestSMS } from "@/hooks/use-test-sms";
import { RadioOptions } from "./send-dialog/message-type/RadioOptions";
import { AIAlert } from "./send-dialog/message-type/AIAlert";
import { SimpleScript } from "@/types/campaign";

interface MessageTypeSelectorProps {
  messageType: "email" | "sms" | "whatsapp" | "ai";
  onMessageTypeChange: (type: "email" | "sms" | "whatsapp" | "ai") => void;
  campaignId: string;
  script: SimpleScript | null;
}

export function MessageTypeSelector({ 
  messageType, 
  onMessageTypeChange, 
  campaignId,
  script 
}: MessageTypeSelectorProps) {
  const smsType = messageType === "ai" ? "sms" : messageType;
  
  const { 
    testPhone, 
    setTestPhone, 
    sendingTestSms, 
    handleSendTestSMS 
  } = useTestSMS(campaignId, smsType as "email" | "sms" | "whatsapp");

  return (
    <div className="space-y-4">
      <RadioOptions messageType={messageType} onMessageTypeChange={onMessageTypeChange} />

      {(messageType === "sms" || messageType === "whatsapp") && (
        <Alert className="mt-4 bg-blue-50 border-blue-200">
          <Phone className="h-4 w-4" />
          <AlertTitle>SMS Marketing System</AlertTitle>
          <AlertDescription>
            Send SMS messages to all leads in this campaign. Messages will be sent from your Twilio number.
          </AlertDescription>
          
          <div className="mt-4 border-t border-blue-100 pt-3">
            <Label htmlFor="test-phone" className="font-medium text-sm mb-2 block">Test SMS Before Sending Campaign</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                id="test-phone"
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Enter phone number (e.g. +8801XXXXXXX)"
                className="flex-1"
              />
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => handleSendTestSMS(script?.content || undefined)}
                disabled={sendingTestSms}
                className="whitespace-nowrap"
              >
                {sendingTestSms ? "Testing..." : "Test SMS"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              A test message will be sent using the Twilio number without affecting campaign logs.
            </p>
          </div>
        </Alert>
      )}

      {messageType === "ai" && <AIAlert />}
    </div>
  );
}
