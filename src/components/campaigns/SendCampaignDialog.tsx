
import React, { useState } from "react";
import { Campaign, Lead, Script } from "@/types/campaign";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface SendCampaignDialogProps {
  campaign: Campaign;
  leads: Lead[];
  leadsLoading: boolean;
  campaignScript: Script | null;
  onSendSuccess: () => void;
}

export function SendCampaignDialog({
  campaign,
  leads,
  leadsLoading,
  campaignScript,
  onSendSuccess
}: SendCampaignDialogProps) {
  const { toast } = useToast();
  const [sendingEmail, setSendingEmail] = useState(false);

  const sendCampaign = async () => {
    if (!campaign || !leads?.length || !campaignScript) {
      toast({
        variant: "destructive",
        title: "Cannot send campaign",
        description: "Missing campaign, leads, or content.",
      });
      return;
    }

    setSendingEmail(true);
    try {
      // In a real implementation, this would call your edge function to send emails
      // For now, we'll simulate a successful send
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update campaign status to "sent"
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'sent' })
        .eq('id', campaign.id);

      if (error) throw error;

      toast({
        title: "Campaign sent",
        description: `Email sent to ${leads.length} leads.`,
      });

      // Call the onSendSuccess callback to refetch campaigns
      onSendSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending campaign",
        description: error.message || "Failed to send the campaign.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>Send Campaign: {campaign?.title}</DialogTitle>
        <DialogDescription>
          Review details and select leads to send this campaign to
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-6 py-4">
        <div>
          <h4 className="font-medium mb-2">Campaign Details</h4>
          <div className="bg-muted p-3 rounded-md">
            <p><strong>Subject:</strong> {campaignScript?.title || "No subject"}</p>
            <p className="mt-2"><strong>Content:</strong></p>
            <div className="mt-1 whitespace-pre-wrap">
              {campaignScript?.content || "No content"}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Recipients</h4>
          {leadsLoading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : leads && leads.length > 0 ? (
            <div className="border rounded-md max-h-[200px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">No leads found for this campaign</p>
            </div>
          )}
        </div>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button 
          onClick={sendCampaign} 
          disabled={sendingEmail || !leads?.length}
        >
          {sendingEmail ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>Send to {leads?.length || 0} Leads</>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
