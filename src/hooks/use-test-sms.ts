
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTestSMS = (campaignId: string, messageType: "email" | "sms" | "whatsapp") => {
  const [testPhone, setTestPhone] = useState<string>("");
  const [sendingTestSms, setSendingTestSms] = useState<boolean>(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { toast } = useToast();
  
  // For handling manually entered Twilio credentials if needed
  const [twilioCredentials, setTwilioCredentials] = useState({
    accountSid: "AC8dba2692e0ad1e1e67e0f2cc48f9fc92",
    authToken: "262ed07dd168db47bfae57405f11c4a9",
    phoneNumber: "+18597808093",
  });
  const [showCredentialsForm, setShowCredentialsForm] = useState<boolean>(false);

  const handleSendTestSMS = async (content?: string) => {
    // Clear previous error details
    setErrorDetails(null);
    
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
    const testMessage = content || "This is a test SMS from Reachlytix - 🚀";

    try {
      console.log(`Sending test ${messageType} to:`, testPhone);
      console.log(`Using Twilio credentials:`, showCredentialsForm ? 'Custom' : 'Environment variables');
      
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
        console.error(`Edge function error when sending test ${messageType}:`, error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error(`Test ${messageType} failed:`, data);
        
        // Extract detailed error information if available
        let errorMessage = data?.error || `Failed to send test ${messageType}`;
        if (data?.details) {
          setErrorDetails(data.details);
        }
        
        if (data?.results?.messages && data.results.messages.length > 0) {
          const firstMessage = data.results.messages[0];
          if (firstMessage.error) {
            errorMessage = firstMessage.error;
          }
        }
        
        throw new Error(errorMessage);
      }

      console.log(`Test ${messageType} response:`, data);

      toast({
        title: "Test message sent",
        description: `Test ${messageType} message sent to ${testPhone}`
      });
    } catch (error: any) {
      console.error(`Error sending test ${messageType}:`, error);
      
      // Check if it might be a Twilio credentials issue
      const errorMessage = error.message || `Failed to send test ${messageType}.`;
      
      // Extract any additional details if available
      if (error.details) {
        setErrorDetails(error.details);
      }
      
      const isTwilioError = errorMessage.toLowerCase().includes('twilio') || 
                          errorMessage.toLowerCase().includes('unauthorized') ||
                          errorMessage.toLowerCase().includes('credentials');
      
      if (isTwilioError && !showCredentialsForm) {
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
    setTwilioCredentials,
    errorDetails
  };
};
