
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SimpleCampaign, SimpleLead, SimpleScript } from "@/types/campaign";
import { sendCampaignEmails, sendCampaignSMS } from "@/utils/campaign-utils";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SendCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: SimpleCampaign | null;
  leads: SimpleLead[];
  script: SimpleScript | null;
  onSendSuccess: () => void;
}

export function SendCampaignDialog({
  isOpen,
  onClose,
  campaign,
  leads,
  script,
  onSendSuccess
}: SendCampaignDialogProps) {
  const { toast } = useToast();
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [messageType, setMessageType] = useState<"email" | "sms">("email");

  const handleSendCampaign = async () => {
    if (!campaign) return;
    
    const campaignId = campaign.id;
    
    if (!leads.length) {
      toast({
        variant: "destructive",
        title: "No leads",
        description: "This campaign doesn't have any leads to send to."
      });
      return;
    }
    
    if (!script && messageType === "email") {
      toast({
        variant: "destructive",
        title: "No content",
        description: "This campaign doesn't have any email content."
      });
      return;
    }
    
    setSendingCampaign(true);
    
    try {
      let result;
      
      if (messageType === "email") {
        result = await sendCampaignEmails(
          campaignId, 
          campaign.title, 
          script?.title || "No Subject",
          script?.content || "",
          leads
        );
      } else {
        result = await sendCampaignSMS(
          campaignId,
          campaign.title,
          script?.content || "Default SMS message",
          leads
        );
      }
      
      toast({
        variant: result.success ? "default" : "destructive",
        title: result.success ? "Success" : "Error",
        description: result.message
      });
      
      if (result.success) {
        onSendSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("Error sending campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send campaign."
      });
    } finally {
      setSendingCampaign(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Campaign</DialogTitle>
          <DialogDescription>
            {campaign && (
              `You're about to send "${campaign.title}" to ${leads.length} leads.`
            )}
            <div className="mt-4">
              <RadioGroup 
                defaultValue={messageType} 
                onValueChange={(val) => setMessageType(val as "email" | "sms")}
                className="flex flex-col space-y-3 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" /> Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms" className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" /> SMS
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={sendingCampaign}
            onClick={handleSendCampaign}
          >
            {sendingCampaign ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>Send Now</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
