import { SimpleCampaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCampaignForm } from "@/hooks/use-campaign-form";
import { CampaignDetailsFields } from "./CampaignDetailsFields";
import { CampaignMessageContent } from "./CampaignMessageContent";
import { SchedulingField } from "./SchedulingField";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectLeadsTab } from "./SelectLeadsTab";
import { Link } from "react-router-dom";
import { InlineLeadUploader } from "./InlineLeadUploader";
import { UploadLeadsModal } from "./UploadLeadsModal";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StartCampaignButton } from "./StartCampaignButton";

interface AudienceOption {
  value: "all";
  label: string;
  count: number;
}

interface CreateCampaignFormProps {
  onCampaignCreated: () => void;
  editingCampaign?: SimpleCampaign | null;
  onCancel?: () => void;
}

export function CreateCampaignForm({
  onCampaignCreated,
  editingCampaign = null,
  onCancel,
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
    handleSave,
  } = useCampaignForm(editingCampaign, onCampaignCreated, onCancel);

  const { user } = useAuth();
  const { toast } = useToast();

  // Audience state
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [audienceOption, setAudienceOption] = useState<AudienceOption>({ value: "all", label: "All Leads", count: 0 });

  // Fetch leads for this user only, as soon as user/id is set
  useEffect(() => {
    async function fetchMyLeads() {
      setLeadsLoading(true);
      if (!user) {
        setLeads([]);
        setLeadsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("created_by", user.id); // Only current user's leads

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch leads",
          description: error.message,
        });
        setLeads([]);
      } else {
        setLeads(data ?? []);
      }
      setLeadsLoading(false);
    }
    fetchMyLeads();
  }, [user]);

  useEffect(() => {
    setAudienceOption({
      value: "all",
      label: "All Leads",
      count: leads.length,
    });
  }, [leads]);

  // Used for Schedule/Start Campaign
  const handleScheduleOrStart = async () => {
    if (!campaignId) {
      toast({
        variant: "destructive",
        title: "Please Save Campaign First",
        description: "You must save campaign details before scheduling.",
      });
      return;
    }
    if (leads.length === 0) {
      toast({
        variant: "destructive",
        title: "No leads available",
        description: "You must have at least one uploaded lead before starting this campaign.",
      });
      return;
    }

    // Remove existing campaign_leads assignments
    await supabase.from("campaign_leads").delete().eq("campaign_id", campaignId);

    // Insert each lead_id
    const records = leads.map(lead => ({
      campaign_id: campaignId,
      lead_id: lead.id,
      created_at: new Date().toISOString(),
    }));

    if (records.length) {
      const { error } = await supabase.from("campaign_leads").insert(records);
      if (error) {
        toast({
          variant: "destructive",
          title: "Error assigning leads",
          description: error.message,
        });
        return;
      }
    } else {
      toast({
        variant: "destructive",
        title: "No leads to assign",
        description: "No valid leads found to assign.",
      });
      return;
    }

    toast({
      title: "Audience assigned",
      description: `Assigned to ${records.length} recipients.`,
    });

    // Call the save handler to persist changes
    await handleSave();
  };

  // Leads upload/refresh logic (unchanged)
  const [currentTab, setCurrentTab] = useState("details");
  const [leadsAssigned, setLeadsAssigned] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [leadUploadTrigger, setLeadUploadTrigger] = useState(Date.now());
  const handleLeadsUploaded = useCallback(() => {
    setLeadUploadTrigger(Date.now());
    setCurrentTab("leads"); // after upload, switch to "Select Leads"
  }, []);

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
        {/* --- Prominent Upload Leads Card/Button --- */}
        <div className="w-full mb-4 flex justify-center">
          <div className="bg-muted/50 border rounded-lg px-6 py-5 flex flex-col items-center text-center max-w-xl shadow-sm">
            <Upload className="w-8 h-8 mb-2 text-primary" />
            <div className="text-lg font-semibold mb-1">Upload Your Leads</div>
            <div className="text-sm text-muted-foreground mb-2">
              Have a CSV list of prospects? Upload your leads before assigning them to this campaign.
            </div>
            <Button type="button" className="mt-2" onClick={() => setModalOpen(true)} size="lg">
              <Upload className="mr-2" /> Upload Leads
            </Button>
          </div>
        </div>
        <UploadLeadsModal open={modalOpen} onOpenChange={setModalOpen} onLeadsUploaded={handleLeadsUploaded} />

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="upload-leads">Upload Leads</TabsTrigger>
            <TabsTrigger value="leads">Select Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <CampaignDetailsFields campaignName={campaignName} description={description} onCampaignNameChange={setCampaignName} onDescriptionChange={setDescription} />
            <SchedulingField scheduledDate={scheduledDate} onScheduledDateChange={setScheduledDate} />
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
            <div className="mb-4">Pick who should receive this campaign:</div>
            <div className="flex items-center space-x-4 mb-4">
              <Button
                variant={audienceOption.value === "all" ? "default" : "outline"}
                onClick={() => setAudienceOption({ value: "all", label: "All Leads", count: leads.length })}
                disabled={leadsLoading || leads.length === 0}
              >
                All Leads ({leadsLoading ? "..." : leads.length}) recipient{leads.length === 1 ? "" : "s"}
              </Button>
            </div>
            <div className="text-muted-foreground text-xs">
              Only your uploaded leads are shown. Want to filter? Use the Select Leads tab.
            </div>
            {leads.length === 0 && !leadsLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">No uploaded leads yet.</div>
            )}
          </TabsContent>
          <TabsContent value="upload-leads">
            <div className="mb-3 text-muted-foreground">
              Upload a CSV file to add new leads, then assign them to this campaign instantly.
            </div>
            <InlineLeadUploader onLeadsUploaded={handleLeadsUploaded} />
          </TabsContent>
          <TabsContent value="leads">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Don&apos;t see your new leads here?{" "}
                <Button
                  variant="link"
                  size="sm"
                  type="button"
                  onClick={() => setCurrentTab("upload-leads")}
                  className="px-1"
                >
                  Upload Leads
                </Button>
              </span>
            </div>
            {campaignId ? (
              <SelectLeadsTab
                campaignId={campaignId}
                key={leadUploadTrigger}
                onLeadsAssigned={() => setLeadsAssigned(true)}
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={handleScheduleOrStart}
                    disabled={leadsLoading || leads.length === 0}
                  >
                    {leads.length === 0 ? "Start Campaign" : scheduledDate ? "Schedule Campaign" : "Start Campaign"}
                  </Button>
                </span>
              </TooltipTrigger>
              {leads.length === 0 && (
                <TooltipContent>
                  Upload at least one lead before you can start a campaign.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
