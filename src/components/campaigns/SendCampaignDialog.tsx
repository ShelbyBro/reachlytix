
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SimpleCampaign, SimpleLead, SimpleScript } from "@/types/campaign";
import { sendCampaignEmails, sendCampaignSMS } from "@/utils/campaign-utils";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  Mail, 
  MessageSquare, 
  CalendarIcon, 
  Loader2, 
  Clock,
  Send as SendIcon,
  CalendarCheck,
  Phone,
  TestTube2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; 
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

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
  const [messageType, setMessageType] = useState<"email" | "sms" | "whatsapp">("email");
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [sendingTestSms, setSendingTestSms] = useState(false);
  const [testPhone, setTestPhone] = useState("+18597808093");

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
    
    if (sendMode === "schedule" && !scheduledDate) {
      toast({
        variant: "destructive",
        title: "Missing schedule",
        description: "Please select a date to schedule this campaign."
      });
      return;
    }

    setSendingCampaign(true);
    
    try {
      if (sendMode === "schedule") {
        // Format the scheduled date and time for storage
        const scheduledDateTime = new Date(scheduledDate!);
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        scheduledDateTime.setHours(hours, minutes);

        // Update the campaign with scheduled time
        const { error: scheduleError } = await supabase
          .from("campaigns")
          .update({
            scheduled_at: scheduledDateTime.toISOString(),
            schedule_status: "scheduled"
          })
          .eq("id", campaignId);

        if (scheduleError) throw scheduleError;

        toast({
          title: "Campaign Scheduled",
          description: `Campaign scheduled for ${format(scheduledDateTime, "PPP")} at ${scheduledTime}`
        });

        onSendSuccess();
        onClose();
        return;
      }
      
      // Immediate send mode
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
        // SMS or WhatsApp
        result = await sendCampaignSMS(
          campaignId,
          campaign.title,
          script?.content || "Thank you for joining Reachlytix. Stay tuned for offers!",
          leads,
          messageType
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

  const handleSendTestSMS = async () => {
    if (!campaign || !testPhone) return;
    
    setSendingTestSms(true);
    
    try {
      const result = await sendCampaignSMS(
        campaign.id,
        campaign.title,
        script?.content || "Thank you for joining Reachlytix. Stay tuned for offers!",
        [],
        messageType,
        true,
        testPhone
      );
      
      toast({
        variant: result.success ? "default" : "destructive",
        title: result.success ? "Test SMS Sent" : "Test SMS Failed",
        description: result.message
      });
      
    } catch (error: any) {
      console.error("Error sending test SMS:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send test SMS."
      });
    } finally {
      setSendingTestSms(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Campaign</DialogTitle>
          <DialogDescription>
            {campaign && (
              `You're about to send "${campaign.title}" to ${leads.length} leads.`
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="messageType" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="messageType">Message Type</TabsTrigger>
            <TabsTrigger value="sendOptions">Send Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="messageType" className="space-y-4">
            <RadioGroup 
              value={messageType} 
              onValueChange={(val) => setMessageType(val as "email" | "sms" | "whatsapp")}
              className="flex flex-col space-y-3"
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
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" id="whatsapp" />
                <Label htmlFor="whatsapp" className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
                </Label>
              </div>
            </RadioGroup>
            
            {(messageType === "sms" || messageType === "whatsapp") && (
              <Alert className="mt-4 bg-blue-50">
                <Phone className="h-4 w-4" />
                <AlertTitle>SMS Marketing System</AlertTitle>
                <AlertDescription>
                  Send SMS messages to all leads in this campaign. Messages will be sent from your Twilio number.
                </AlertDescription>
                
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      type="tel"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="Test phone number"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSendTestSMS}
                      disabled={sendingTestSms}
                      className="whitespace-nowrap"
                    >
                      {sendingTestSms ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube2 className="mr-2 h-4 w-4" />
                          Test SMS
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="sendOptions" className="space-y-4">
            <RadioGroup 
              value={sendMode} 
              onValueChange={(val) => setSendMode(val as "now" | "schedule")}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="now" id="now" />
                <Label htmlFor="now" className="flex items-center">
                  <SendIcon className="w-4 h-4 mr-2" /> Send Now
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="schedule" id="schedule" />
                <Label htmlFor="schedule" className="flex items-center">
                  <CalendarCheck className="w-4 h-4 mr-2" /> Schedule Send
                </Label>
              </div>
            </RadioGroup>
            
            {sendMode === "schedule" && (
              <div className="space-y-4 pl-6 pt-2">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? (
                          format(scheduledDate, "PPP")
                        ) : (
                          <span>Select a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Time</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="border rounded p-2 w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={sendingCampaign}
            onClick={handleSendCampaign}
            className="gap-2"
          >
            {sendingCampaign ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {sendMode === "schedule" ? "Scheduling..." : "Sending..."}
              </>
            ) : (
              <>
                {sendMode === "schedule" ? (
                  <>
                    <CalendarCheck className="h-4 w-4" />
                    Schedule
                  </>
                ) : (
                  <>
                    {messageType === "email" ? (
                      <>
                        <Mail className="h-4 w-4" />
                        Send Email
                      </>
                    ) : messageType === "sms" ? (
                      <>
                        <MessageSquare className="h-4 w-4" />
                        Send SMS Now
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4" />
                        Send WhatsApp
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
