
import { useState } from "react";
import { SimpleCampaign } from "@/types/campaign";

export const useCampaignFormState = (editingCampaign: SimpleCampaign | null = null) => {
  const [campaignName, setCampaignName] = useState(editingCampaign?.title || "");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState(editingCampaign?.description || "");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    editingCampaign?.scheduled_at ? new Date(editingCampaign.scheduled_at) : undefined
  );
  const [messageType, setMessageType] = useState<"email" | "sms" | "whatsapp">("email");
  const [smsContent, setSmsContent] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappContent, setWhatsappContent] = useState("");

  return {
    campaignName,
    setCampaignName,
    subject,
    setSubject,
    content,
    setContent,
    description,
    setDescription,
    scheduledDate,
    setScheduledDate,
    messageType,
    setMessageType,
    smsContent,
    setSmsContent,
    whatsappEnabled,
    setWhatsappEnabled,
    whatsappContent,
    setWhatsappContent,
  };
};

