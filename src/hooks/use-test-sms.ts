
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTestSMS = (campaignId: string, messageType: "email" | "sms" | "whatsapp") => {
  const [testPhone, setTestPhone] = useState<string>("");
  const [sendingTestSms, setSendingTestSms] = useState<boolean>(false);
  const { toast } = useToast();
  
  // For handling manually entered Twilio credentials if needed
  const [twilioCredentials, setTwilioCredentials] = useState({
    accountSid: "",
    authToken: "",
    phoneNumber: "",
  });
  const [showCredentialsForm, setShowCredentialsForm] = useState<boolean>(false);

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
      console.log("Sending test SMS to:", testPhone);
      
      const { data, error } = await supabase.functions.invoke("send-campaign-sms", {
        body: {
          campaignId,
          content: testMessage,
          isTest: true,
          testPhone,
          messageType,
          // Include manual credentials if provided
          twilioCredentials: showCredentialsForm ? twilioCredentials : undefined
        }
      });

      if (error) {
        console.error("Error sending test SMS:", error);
        throw error;
      }

      console.log("Test SMS response:", data);

      toast({
        title: "Test message sent",
        description: `Test ${messageType} message sent to ${testPhone}`
      });
    } catch (error: any) {
      console.error("Error sending test SMS:", error);
      
      // Check if it might be a Twilio credentials issue
      const errorMessage = error.message || "Failed to send test message.";
      const isTwilioError = errorMessage.toLowerCase().includes('twilio') || 
                            errorMessage.toLowerCase().includes('unauthorized') ||
                            errorMessage.toLowerCase().includes('credentials');
      
      if (isTwilioError) {
        setShowCredentialsForm(true);
        toast({
          variant: "destructive",
          title: "Twilio credentials error",
          description: "Please check your Twilio credentials and try again."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
      }
    } finally {
      setSendingTestSms(false);
    }
  };

  return {
    testPhone,
    setTestPhone,
    sendingTestSms,
    handleSendTestSMS,
    showCredentialsForm,
    setShowCredentialsForm,
    twilioCredentials,
    setTwilioCredentials
  };
};
