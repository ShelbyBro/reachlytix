
import { SimpleCampaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCampaignForm } from "@/hooks/use-campaign-form";
import { CampaignDetailsFields } from "./CampaignDetailsFields";
import { EmailContentFields } from "./EmailContentFields";
import { SchedulingField } from "./SchedulingField";

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
    handleSave
  } = useCampaignForm(editingCampaign, onCampaignCreated, onCancel);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingCampaign ? "Edit Campaign" : "Create New Campaign"}</CardTitle>
        <CardDescription>
          {editingCampaign 
            ? "Update your campaign information and email content below." 
            : "Enter your campaign information and email content below."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CampaignDetailsFields
          campaignName={campaignName}
          description={description}
          onCampaignNameChange={setCampaignName}
          onDescriptionChange={setDescription}
        />

        <EmailContentFields
          subject={subject}
          content={content}
          onSubjectChange={setSubject}
          onContentChange={setContent}
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
