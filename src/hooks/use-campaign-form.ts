
import { useEffect } from "react";
import { SimpleCampaign } from "@/types/campaign";
import { useCampaignFormState } from "./use-campaign-form-state";
import { useCampaignScript } from "./use-campaign-script";
import { useCampaignSave } from "./use-campaign-save";

export const useCampaignForm = (
  editingCampaign: SimpleCampaign | null = null,
  onSuccess: () => void,
  onCancel?: () => void
) => {
  const formState = useCampaignFormState(editingCampaign);
  const { fetchScript } = useCampaignScript();
  const { handleSave: saveHandler } = useCampaignSave(editingCampaign, onSuccess);

  // Add a campaignId to the hook's return value
  const campaignId = editingCampaign?.id || "";

  useEffect(() => {
    if (editingCampaign?.script_id) {
      fetchScript(editingCampaign.script_id).then(script => {
        if (script) {
          if (script.type === "sms") {
            formState.setSmsContent(script.content || "");
          } else if (script.type === "whatsapp") {
            formState.setWhatsappContent(script.content || "");
            formState.setWhatsappEnabled(true);
          } else {
            formState.setSubject(script.title || "");
            formState.setContent(script.content || "");
          }
        }
      });
    }
  }, [editingCampaign]);

  const handleSave = async () => {
    await saveHandler({
      campaignName: formState.campaignName,
      description: formState.description,
      scheduledDate: formState.scheduledDate,
      messageType: formState.messageType,
      subject: formState.subject,
      content: formState.content,
    });
  };

  return {
    ...formState,
    campaignId, // Include campaignId in the returned object
    handleSave,
  };
};
