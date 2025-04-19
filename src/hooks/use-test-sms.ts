
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendCampaignSMS } from "@/utils/campaign-utils";

export const useTestSMS = (campaignId: string, messageType: "sms" | "whatsapp") => {
  const { toast } = useToast();
  const [sendingTestSms, setSendingTestSms] = useState(false);
  const [testPhone, setTestPhone] = useState("+18597808093");

  const handleSendTestSMS = async (content: string) => {
    if (!campaignId || !testPhone) return;
    
    setSendingTestSms(true);
    
    try {
      const result = await sendCampaignSMS(
        campaignId,
        "Test Campaign",
        content || "Thank you for joining Reachlytix. Stay tuned for offers!",
        [],
        messageType,
        true,
        testPhone
      );
      
      toast({
        variant: result.success ? "default" : "destructive",
        title: result.success ? "Test SMS Sent" : "Test SMS Failed",
        description: result.message
      });
      
    } catch (error: any) {
      console.error("Error sending test SMS:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send test SMS."
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
