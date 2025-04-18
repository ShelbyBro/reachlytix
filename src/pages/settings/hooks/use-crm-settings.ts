
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useCrmSettings() {
  const { toast } = useToast();
  const [emailSenderName, setEmailSenderName] = useState("Reachlytix CRM");

  const updateCrmSettings = async () => {
    // In a real application, this would save to a settings table
    toast({
      title: "Settings updated",
      description: "CRM settings have been saved."
    });
  };

  return {
    emailSenderName,
    setEmailSenderName,
    updateCrmSettings
  };
}
