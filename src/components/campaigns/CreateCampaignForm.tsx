
import { SimpleCampaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCampaignForm } from "@/hooks/use-campaign-form";
import { CampaignDetailsFields } from "./CampaignDetailsFields";
import { CampaignMessageContent } from "./CampaignMessageContent";
import { SchedulingField } from "./SchedulingField";
import { Separator } from "@/components/ui/separator";

interface CreateCampaignFormProps {
  onCampaignCreated: () => void;
  editingCampaign?: SimpleCampaign | null;
  onCancel?: () => void;
}

export function CreateCampaignForm({ 
  onCampaignCreated, 
  editingCampaign = null,
  onCancel 
}: CreateCampaignFormProps) {
  const {
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
    smsContent,
    setSmsContent,
    whatsappEnabled,
    setWhatsappEnabled,
    whatsappContent,
    setWhatsappContent,
    messageType,
    setMessageType,
    campaignId, // Add this line to extract campaignId
    handleSave
  } = useCampaignForm(editingCampaign, onCampaignCreated, onCancel);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingCampaign ? "Edit Campaign" : "Create New Campaign"}</CardTitle>
        <CardDescription>
          {editingCampaign 
            ? "Update your campaign information and message content below." 
            : "Enter your campaign information and message content below."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CampaignDetailsFields
          campaignName={campaignName}
          description={description}
          onCampaignNameChange={setCampaignName}
          onDescriptionChange={setDescription}
        />

        <Separator className="my-6" />

        <CampaignMessageContent
          messageType={messageType}
          setMessageType={setMessageType}
          subject={subject}
          content={content}
          smsContent={smsContent}
          whatsappContent={whatsappContent}
          whatsappEnabled={whatsappEnabled}
          onSubjectChange={setSubject}
          onContentChange={setContent}
          onSmsContentChange={setSmsContent}
          onWhatsappContentChange={setWhatsappContent}
          onWhatsappEnabledChange={setWhatsappEnabled}
          campaignId={campaignId} // Pass campaignId here
        />

        <SchedulingField
          scheduledDate={scheduledDate}
          onScheduledDateChange={setScheduledDate}
        />

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave}>
            {editingCampaign ? "Update Campaign" : "Create Campaign"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
