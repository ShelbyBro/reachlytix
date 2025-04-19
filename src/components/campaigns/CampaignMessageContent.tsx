
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail, MessageSquare } from "lucide-react";
import { EmailContentFields } from "./EmailContentFields";

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
  onWhatsappEnabledChange
}: CampaignMessageContentProps) {
  return (
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
          onSubjectChange={onSubjectChange}
          onContentChange={onContentChange}
        />
      </TabsContent>
      
      <TabsContent value="sms" className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="smsContent">SMS Content</Label>
          <Textarea
            id="smsContent"
            placeholder="Enter your SMS message (160 characters recommended for single SMS)"
            value={smsContent}
            onChange={(e) => onSmsContentChange(e.target.value)}
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
            onCheckedChange={onWhatsappEnabledChange}
          />
          <Label htmlFor="whatsapp-active">Enable WhatsApp messaging</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="whatsappContent">WhatsApp Message</Label>
          <Textarea
            id="whatsappContent"
            placeholder="Enter your WhatsApp message content"
            value={whatsappContent}
            onChange={(e) => onWhatsappContentChange(e.target.value)}
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
  );
}
