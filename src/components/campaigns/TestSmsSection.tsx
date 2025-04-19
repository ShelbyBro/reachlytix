
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Settings } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTestSMS } from "@/hooks/use-test-sms";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface TestSmsSectionProps {
  campaignId: string;
  messageType: "email" | "sms" | "whatsapp";
}

export function TestSmsSection({ campaignId, messageType }: TestSmsSectionProps) {
  const { 
    testPhone, 
    setTestPhone, 
    sendingTestSms, 
    handleSendTestSMS,
    showCredentialsForm,
    setShowCredentialsForm,
    twilioCredentials,
    setTwilioCredentials
  } = useTestSMS(campaignId, messageType);

  return (
    <>
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
              onClick={() => handleSendTestSMS("This is a test SMS from Reachlytix - 🚀")}
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
          <div className="flex justify-between">
            <p className="text-xs text-muted-foreground">
              A test message with predefined content will be sent to verify your configuration.
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowCredentialsForm(true)}
              className="text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Twilio Settings
            </Button>
          </div>
        </div>
      </Alert>

      {/* Twilio Credentials Dialog */}
      <Dialog open={showCredentialsForm} onOpenChange={setShowCredentialsForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Twilio Credentials</DialogTitle>
            <DialogDescription>
              Enter your Twilio credentials to send test messages. These will only be used for this session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="twilio-sid">Twilio Account SID</Label>
              <Input
                id="twilio-sid"
                value={twilioCredentials.accountSid}
                onChange={(e) => setTwilioCredentials({...twilioCredentials, accountSid: e.target.value})}
                placeholder="AC..."
                defaultValue="AC8dba2692e0ad1e1e67e0f2cc48f9fc92"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="twilio-token">Auth Token</Label>
              <Input
                id="twilio-token"
                type="password"
                value={twilioCredentials.authToken}
                onChange={(e) => setTwilioCredentials({...twilioCredentials, authToken: e.target.value})}
                defaultValue="262ed07dd168db47bfae57405f11c4a9"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="twilio-number">Twilio Phone Number</Label>
              <Input
                id="twilio-number"
                value={twilioCredentials.phoneNumber}
                onChange={(e) => setTwilioCredentials({...twilioCredentials, phoneNumber: e.target.value})}
                placeholder="+1234567890"
                defaultValue="+18597808093"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCredentialsForm(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowCredentialsForm(false);
              // Try to send the test again with the new credentials
              handleSendTestSMS("This is a test SMS from Reachlytix - 🚀");
            }}>Save & Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
