
import { SimpleCampaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCampaignForm } from "@/hooks/use-campaign-form";
import { CampaignDetailsFields } from "./CampaignDetailsFields";
import { CampaignMessageContent } from "./CampaignMessageContent";
import { SchedulingField } from "./SchedulingField";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectLeadsTab } from "./SelectLeadsTab";
import { Link } from "react-router-dom";

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
    campaignId,
    handleSave
  } = useCampaignForm(editingCampaign, onCampaignCreated, onCancel);

  const [currentTab, setCurrentTab] = useState("details");
  const [leadsAssigned, setLeadsAssigned] = useState(false);

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
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="leads">Select Leads</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <CampaignDetailsFields
              campaignName={campaignName}
              description={description}
              onCampaignNameChange={setCampaignName}
              onDescriptionChange={setDescription}
            />
            <SchedulingField
              scheduledDate={scheduledDate}
              onScheduledDateChange={setScheduledDate}
            />
          </TabsContent>
          <TabsContent value="content">
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
              campaignId={campaignId}
            />
          </TabsContent>
          <TabsContent value="audience">
            <Separator className="my-6" />
            Audience Tab Content
          </TabsContent>
          <TabsContent value="leads">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Don't see your leads?{" "}
              </span>
              <Link to="/upload">
                <Button variant="outline" size="sm">Upload New Leads</Button>
              </Link>
            </div>
            {campaignId ? (
              <SelectLeadsTab
                campaignId={campaignId}
                onLeadsAssigned={() => {
                  setLeadsAssigned(true);
                }}
              />
            ) : (
              <div className="text-sm text-muted-foreground">Please save campaign details first to select leads.</div>
            )}
          </TabsContent>
        </Tabs>

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
