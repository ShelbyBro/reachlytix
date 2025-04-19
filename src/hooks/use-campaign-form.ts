
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SimpleCampaign } from "@/types/campaign";

export const useCampaignForm = (
  editingCampaign: SimpleCampaign | null = null,
  onSuccess: () => void,
  onCancel?: () => void
) => {
  const { toast } = useToast();
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [messageType, setMessageType] = useState<"email" | "sms" | "whatsapp">("email");
  const [smsContent, setSmsContent] = useState("");
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappContent, setWhatsappContent] = useState("");

  useEffect(() => {
    if (editingCampaign) {
      setCampaignName(editingCampaign.title || "");
      setDescription(editingCampaign.description || "");
      
      // Set message type based on campaign type if available
      if (editingCampaign.type) {
        if (editingCampaign.type === "sms") {
          setMessageType("sms");
        } else if (editingCampaign.type === "whatsapp") {
          setMessageType("whatsapp");
          setWhatsappEnabled(true);
        } else {
          setMessageType("email");
        }
      }
      
      if (editingCampaign.scheduled_at) {
        setScheduledDate(new Date(editingCampaign.scheduled_at));
      }
      
      if (editingCampaign.script_id) {
        fetchScript(editingCampaign.script_id);
      }
    }
  }, [editingCampaign]);

  const fetchScript = async (scriptId: string) => {
    const { data: script, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", scriptId)
      .single();

    if (error) {
      console.error("Error fetching script:", error);
      return;
    }

    if (script) {
      if (script.type === "sms") {
        setSmsContent(script.content || "");
      } else if (script.type === "whatsapp") {
        setWhatsappContent(script.content || "");
        setWhatsappEnabled(true);
      } else {
        setSubject(script.title || "");
        setContent(script.content || "");
      }
    }
  };

  const handleSave = async () => {
    try {
      // Validate based on the selected message type
      if (!campaignName) {
        toast({
          variant: "destructive",
          title: "Missing campaign name",
          description: "Please enter a name for your campaign."
        });
        return;
      }

      if (messageType === "email" && (!subject || !content)) {
        toast({
          variant: "destructive",
          title: "Missing email content",
          description: "Please enter both subject and content for your email."
        });
        return;
      } else if (messageType === "sms" && !smsContent) {
        toast({
          variant: "destructive",
          title: "Missing SMS content",
          description: "Please enter content for your SMS message."
        });
        return;
      } else if (messageType === "whatsapp" && (!whatsappEnabled || !whatsappContent)) {
        toast({
          variant: "destructive",
          title: "WhatsApp not configured",
          description: "Please enable WhatsApp and enter message content."
        });
        return;
      }

      if (editingCampaign) {
        await updateCampaign();
      } else {
        await createCampaign();
      }

      resetForm();
      onSuccess();
      if (onCancel) onCancel();
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save campaign."
      });
    }
  };

  const updateCampaign = async () => {
    if (!editingCampaign) return;

    // Determine the content and type based on selected message type
    let scriptTitle = subject;
    let scriptContent = content;
    let scriptType = "email";

    if (messageType === "sms") {
      scriptTitle = "SMS Message";
      scriptContent = smsContent;
      scriptType = "sms";
    } else if (messageType === "whatsapp" && whatsappEnabled) {
      scriptTitle = "WhatsApp Message";
      scriptContent = whatsappContent;
      scriptType = "whatsapp";
    }

    const { error: scriptError } = await supabase
      .from("scripts")
      .update({
        title: scriptTitle,
        content: scriptContent,
        type: scriptType
      })
      .eq("id", editingCampaign.script_id);

    if (scriptError) throw scriptError;

    const { error: campaignError } = await supabase
      .from("campaigns")
      .update({
        title: campaignName,
        description: description,
        scheduled_at: scheduledDate?.toISOString(),
        type: messageType,
      })
      .eq("id", editingCampaign.id);

    if (campaignError) throw campaignError;

    toast({
      title: "Campaign updated",
      description: "Your campaign has been updated successfully."
    });
  };

  const createCampaign = async () => {
    // Determine the content and type based on selected message type
    let scriptTitle = subject;
    let scriptContent = content;
    let scriptType = "email";

    if (messageType === "sms") {
      scriptTitle = "SMS Message";
      scriptContent = smsContent;
      scriptType = "sms";
    } else if (messageType === "whatsapp" && whatsappEnabled) {
      scriptTitle = "WhatsApp Message";
      scriptContent = whatsappContent;
      scriptType = "whatsapp";
    }

    const { data: scriptData, error: scriptError } = await supabase
      .from("scripts")
      .insert({
        title: scriptTitle,
        content: scriptContent,
        type: scriptType
      })
      .select();

    if (scriptError) throw scriptError;
    
    const newScript = scriptData[0];

    const { error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        title: campaignName,
        description: description,
        status: "draft",
        schedule_status: "draft",
        type: messageType,
        script_id: newScript.id,
        scheduled_at: scheduledDate?.toISOString(),
      })
      .select();

    if (campaignError) throw campaignError;

    toast({
      title: "Campaign created",
      description: "Your campaign has been created successfully."
    });
  };

  const resetForm = () => {
    setCampaignName("");
    setSubject("");
    setContent("");
    setDescription("");
    setScheduledDate(undefined);
    setMessageType("email");
    setSmsContent("");
    setWhatsappEnabled(false);
    setWhatsappContent("");
  };

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
    handleSave
  };
};
