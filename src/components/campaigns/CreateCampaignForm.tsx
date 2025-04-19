
import { SimpleCampaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCampaignForm } from "@/hooks/use-campaign-form";
import { CampaignDetailsFields } from "./CampaignDetailsFields";
import { CampaignMessageContent } from "./CampaignMessageContent";
import { AICampaignGenerator } from "./AICampaignGenerator";
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
    handleSave
  } = useCampaignForm(editingCampaign, onCampaignCreated, onCancel);

  const handleGeneratedContent = (content: { email: string; sms: string; whatsapp: string }) => {
    setContent(content.email);
    setSmsContent(content.sms);
    setWhatsappContent(content.whatsapp);
  };

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

        {/* Highlight the AI Assistant with a separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Quick Content Generation</span>
          </div>
        </div>

        {/* Make AI Generator more prominent */}
        <AICampaignGenerator onGeneratedContent={handleGeneratedContent} />

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
