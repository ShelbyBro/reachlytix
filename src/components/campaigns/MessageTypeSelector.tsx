import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send, Bot } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Loader2 } from "lucide-react";
import { useTestSMS } from "@/hooks/use-test-sms";

interface MessageTypeSelectorProps {
  messageType: "email" | "sms" | "whatsapp" | "ai";
  onMessageTypeChange: (type: "email" | "sms" | "whatsapp" | "ai") => void;
  campaignId: string;
  script: { content?: string } | null;
}

export function MessageTypeSelector({ 
  messageType, 
  onMessageTypeChange,
  campaignId,
  script
}: MessageTypeSelectorProps) {
  const { 
    testPhone, 
    setTestPhone, 
    sendingTestSms, 
    handleSendTestSMS 
  } = useTestSMS(campaignId, messageType);

  return (
    <div className="space-y-4">
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
                placeholder="Enter phone number (e.g. +8801841984046)"
                className="flex-1"
              />
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => handleSendTestSMS(script?.content || undefined)}
                disabled={sendingTestSms}
                className="whitespace-nowrap"
              >
                {sendingTestSms ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Test SMS
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              A test message will be sent using the Twilio number without affecting campaign logs.
            </p>
          </div>
        </Alert>
      )}
    </div>
  );
}
