
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

  useEffect(() => {
    if (editingCampaign) {
      setCampaignName(editingCampaign.title || "");
      setDescription(editingCampaign.description || "");
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
      setSubject(script.title || "");
      setContent(script.content || "");
    }
  };

  const handleSave = async () => {
    try {
      if (!campaignName || !subject || !content) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill out all required fields."
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

    const { error: scriptError } = await supabase
      .from("scripts")
      .update({
        title: subject,
        content: content,
      })
      .eq("id", editingCampaign.script_id);

    if (scriptError) throw scriptError;

    const { error: campaignError } = await supabase
      .from("campaigns")
      .update({
        title: campaignName,
        description: description,
        scheduled_at: scheduledDate?.toISOString(),
      })
      .eq("id", editingCampaign.id);

    if (campaignError) throw campaignError;

    toast({
      title: "Campaign updated",
      description: "Your campaign has been updated successfully."
    });
  };

  const createCampaign = async () => {
    const { data: scriptData, error: scriptError } = await supabase
      .from("scripts")
      .insert({
        title: subject,
        content: content,
        type: "email"
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
        type: "email",
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
    handleSave
  };
};
