
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTestSMS = (campaignId: string, messageType: "email" | "sms" | "whatsapp") => {
  const [testPhone, setTestPhone] = useState<string>("");
  const [sendingTestSms, setSendingTestSms] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSendTestSMS = async (content?: string) => {
    // Skip if not SMS or WhatsApp message type
    if (messageType === "email") {
      toast({
        description: "Email testing is not available in this interface.",
      });
      return;
    }

    if (!testPhone) {
      toast({
        variant: "destructive",
        title: "Missing phone number",
        description: "Please enter a phone number for the test message."
      });
      return;
    }

    setSendingTestSms(true);

    // Always use the fixed test message content
    const testMessage = "This is a test SMS from Reachlytix - 🚀";

    try {
      const { data, error } = await supabase.functions.invoke("send-campaign-sms", {
        body: {
          campaignId,
          content: testMessage,
          isTest: true,
          testPhone,
          messageType
        }
      });

      if (error) throw error;

      toast({
        title: "Test message sent",
        description: `Test ${messageType} message sent to ${testPhone}`
      });
    } catch (error: any) {
      console.error("Error sending test SMS:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send test message."
      });
    } finally {
      setSendingTestSms(false);
    }
  };

  return {
    testPhone,
    setTestPhone,
    sendingTestSms,
    handleSendTestSMS
  };
};
