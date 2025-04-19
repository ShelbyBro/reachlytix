import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageTypeSelector } from "./MessageTypeSelector";
import { TestSmsSection } from "./TestSmsSection";

interface CampaignMessageContentProps {
  messageType: "email" | "sms" | "whatsapp";
  setMessageType: (type: "email" | "sms" | "whatsapp") => void;
  subject: string;
  content: string;
  smsContent: string;
  whatsappContent: string;
  whatsappEnabled: boolean;
  onSubjectChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSmsContentChange: (value: string) => void;
  onWhatsappContentChange: (value: string) => void;
  onWhatsappEnabledChange: (value: boolean) => void;
  campaignId: string;
}

export function CampaignMessageContent({
  messageType,
  setMessageType,
  subject,
  content,
  smsContent,
  whatsappContent,
  whatsappEnabled,
  onSubjectChange,
  onContentChange,
  onSmsContentChange,
  onWhatsappContentChange,
  onWhatsappEnabledChange,
  campaignId
}: CampaignMessageContentProps) {
  return (
    <div className="space-y-4">
      <MessageTypeSelector
        messageType={messageType}
        onMessageTypeChange={setMessageType}
        campaignId={campaignId}
      />

      {/* Message Content Area */}
      {messageType === "email" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              placeholder="Email Content"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={5}
            />
          </div>
        </>
      )}

      {messageType === "sms" && (
        <div className="space-y-2">
          <Label htmlFor="smsContent">SMS Content</Label>
          <Textarea
            id="smsContent"
            placeholder="SMS Content"
            value={smsContent}
            onChange={(e) => onSmsContentChange(e.target.value)}
            rows={5}
          />
        </div>
      )}

      {messageType === "whatsapp" && (
        <>
          <div className="flex items-center space-x-2">
            <Switch id="whatsappEnabled" checked={whatsappEnabled} onCheckedChange={onWhatsappEnabledChange} />
            <Label htmlFor="whatsappEnabled">Enable WhatsApp</Label>
          </div>
          {whatsappEnabled && (
            <div className="space-y-2">
              <Label htmlFor="whatsappContent">WhatsApp Content</Label>
              <Textarea
                id="whatsappContent"
                placeholder="WhatsApp Content"
                value={whatsappContent}
                onChange={(e) => onWhatsappContentChange(e.target.value)}
                rows={5}
              />
            </div>
          )}
        </>
      )}

      {/* Add Test SMS Section for SMS/WhatsApp types */}
      {(messageType === "sms" || messageType === "whatsapp") && (
        <TestSmsSection
          campaignId={campaignId}
          messageType={messageType}
        />
      )}
    </div>
  );
}
