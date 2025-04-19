
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTestSMS } from "@/hooks/use-test-sms";

interface TestSmsSectionProps {
  campaignId: string;
  messageType: "email" | "sms" | "whatsapp";
}

export function TestSmsSection({ campaignId, messageType }: TestSmsSectionProps) {
  const { testPhone, setTestPhone, sendingTestSms, handleSendTestSMS } = useTestSMS(
    campaignId,
    messageType
  );

  return (
    <Alert className="mt-4 bg-blue-50 border-blue-200">
      <AlertTitle className="text-lg font-semibold mb-2">Test Message</AlertTitle>
      <AlertDescription className="mb-4">
        Send a test message before launching your campaign. This won't affect your campaign logs.
      </AlertDescription>
      
      <div className="space-y-3">
        <Label htmlFor="test-phone" className="font-medium">Test Phone Number</Label>
        <div className="flex items-center space-x-2">
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
            onClick={() => handleSendTestSMS()}
            disabled={sendingTestSms}
            className="whitespace-nowrap"
          >
            {sendingTestSms ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          A test message with predefined content will be sent to verify your configuration.
        </p>
      </div>
    </Alert>
  );
}
