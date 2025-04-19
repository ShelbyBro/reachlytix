
import { SimpleCampaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCampaignForm } from "@/hooks/use-campaign-form";
import { CampaignDetailsFields } from "./CampaignDetailsFields";
import { EmailContentFields } from "./EmailContentFields";
import { SchedulingField } from "./SchedulingField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Mail, MessageSquare } from "lucide-react";

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
      <CardContent className="space-y-4">
        <CampaignDetailsFields
          campaignName={campaignName}
          description={description}
          onCampaignNameChange={setCampaignName}
          onDescriptionChange={setDescription}
        />

        <Tabs
          defaultValue="email"
          value={messageType}
          onValueChange={(value) => setMessageType(value as "email" | "sms" | "whatsapp")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> SMS
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> WhatsApp
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="pt-4">
            <EmailContentFields
              subject={subject}
              content={content}
              onSubjectChange={setSubject}
              onContentChange={setContent}
            />
          </TabsContent>
          
          <TabsContent value="sms" className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smsContent">SMS Content</Label>
              <Textarea
                id="smsContent"
                placeholder="Enter your SMS message (160 characters recommended for single SMS)"
                value={smsContent}
                onChange={(e) => setSmsContent(e.target.value)}
                rows={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Keep messages brief for best delivery</span>
                <span>{smsContent.length}/160 characters</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="whatsapp" className="pt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="whatsapp-active"
                checked={whatsappEnabled}
                onCheckedChange={setWhatsappEnabled}
              />
              <Label htmlFor="whatsapp-active">Enable WhatsApp messaging</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsappContent">WhatsApp Message</Label>
              <Textarea
                id="whatsappContent"
                placeholder="Enter your WhatsApp message content"
                value={whatsappContent}
                onChange={(e) => setWhatsappContent(e.target.value)}
                rows={5}
                disabled={!whatsappEnabled}
                className={!whatsappEnabled ? "opacity-50" : ""}
              />
              {whatsappEnabled && (
                <p className="text-xs text-muted-foreground">
                  You can include text formatting, emojis, and longer content in WhatsApp messages
                </p>
              )}
              {!whatsappEnabled && (
                <p className="text-xs text-amber-600">
                  Enable WhatsApp messaging to edit this content
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
