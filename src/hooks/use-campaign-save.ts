
import { SimpleCampaign } from "@/types/campaign";
import { useToast } from "@/hooks/use-toast";
import { useCampaignCreate } from "./use-campaign-create";
import { useCampaignUpdate } from "./use-campaign-update";

export const useCampaignSave = (
  editingCampaign: SimpleCampaign | null,
  onSuccess: () => void
) => {
  const { toast } = useToast();
  const { createCampaign } = useCampaignCreate(onSuccess);
  const { updateCampaign } = useCampaignUpdate(editingCampaign?.id || "", onSuccess);

  const handleSave = async (
    formData: {
      campaignName: string;
      description: string;
      scheduledDate?: Date;
      messageType: string;
      subject: string;
      content: string;
    }
  ) => {
    try {
      const campaignData = {
        title: formData.campaignName,
        description: formData.description,
        scheduled_at: formData.scheduledDate?.toISOString(),
        type: formData.messageType,
      };

      const scriptData = {
        subject: formData.subject,
        content: formData.content,
        type: formData.messageType,
      };

      if (editingCampaign) {
        await updateCampaign(campaignData, scriptData);
      } else {
        await createCampaign(campaignData, scriptData);
      }
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save campaign."
      });
    }
  };

  return {
    handleSave,
  };
};
