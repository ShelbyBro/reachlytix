import { SimpleCampaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCampaignForm } from "@/hooks/use-campaign-form";
import { CampaignDetailsFields } from "./CampaignDetailsFields";
import { CampaignMessageContent } from "./CampaignMessageContent";
import { SchedulingField } from "./SchedulingField";
import { useState } from "react";
import { Upload } from "lucide-react";
import { useCampaignLeadsUpload } from "@/hooks/use-campaign-leads-upload";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface CreateCampaignFormProps {
  onCampaignCreated: () => void;
  editingCampaign?: SimpleCampaign | null;
  onCancel?: () => void;
}

function parseCSVTextToLeads(csvText: string) {
  // Basic CSV parser (assumes headers: name,email,phone)
  const lines = csvText.trim().split("\n").filter(line => !!line);
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(",").map(h => h.trim().toLowerCase());
  return rows.map(row => {
    const values = row.split(",");
    const lead: any = {};
    headers.forEach((h, idx) => (lead[h] = values[idx] || ""));
    return lead;
  });
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

  const { toast } = useToast();
  const { user } = useAuth();

  // Campaign lead upload (per-campaign, local to this campaign only)
  const {
    uploadedLeads,
    uploading,
    uploadLeads,
    clearLeads,
  } = useCampaignLeadsUpload(campaignId);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  // Handle CSV file upload + associate leads to campaign
  const handleCsvUpload = async (file: File) => {
    setCsvFile(file);
    const text = await file.text();
    const csvLeads = parseCSVTextToLeads(text);
    // Very basic: skip completely empty rows (edge cases)
    const validLeads = csvLeads.filter(l => !!l.email || !!l.phone);

    const inserted = await uploadLeads(validLeads);
    if (!inserted) {
      toast({
        variant: "destructive",
        title: "Lead Upload Failed",
        description: "Could not upload leads. Please check your CSV.",
      });
    }
  };

  // Only allow "start"/"schedule" when there are leads uploaded
  const canSubmitCampaign = campaignName && uploadedLeads.length > 0 && !uploading;

  // --- UPDATE: Only apply email campaign logic for type "email"
  const isEmailCampaign = messageType === "email";

  // Handle campaign save/upload flow -- only for EMAIL campaigns.
  const handleStartOrSchedule = async () => {
    if (!campaignName || uploadedLeads.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing required info",
        description: "Please provide campaign name and upload leads.",
      });
      return;
    }

    setSending(true);

    try {
      // 1. Save campaign with subject/content in campaigns table (and ensure type=email)
      if (!isEmailCampaign) {
        // fallback to original logic for other types (not touched)
        await handleSave();
        setSending(false);
        return;
      }
      // Save subject/content in campaigns table for email
      await handleSave();

      // 2. Leads: Ensure all leads are uploaded and linked
      // Leads are already uploaded in uploadLeads(), which also creates campaign_leads rows

      // 3. Show visual feedback
      toast({
        title: "Campaign ready!",
        description: `Campaign "${campaignName}" saved with ${uploadedLeads.length} recipient${uploadedLeads.length === 1 ? "" : "s"}.`,
      });

      if (onCampaignCreated) onCampaignCreated();

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.message || "Failed to save email campaign.",
      });
    } finally {
      setSending(false);
    }
  };

  // Streamlined campaign create form (no more segments or audience selectors)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingCampaign ? "Edit Campaign" : "Create New Campaign"}</CardTitle>
        <CardDescription>
          {editingCampaign
            ? "Update your campaign information and message content below."
            : "Enter your campaign information, message content, and attach a CSV of leads for this campaign."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Details */}
        <CampaignDetailsFields 
          campaignName={campaignName} description={description}
          onCampaignNameChange={setCampaignName} onDescriptionChange={setDescription}
        />
        <SchedulingField scheduledDate={scheduledDate} onScheduledDateChange={setScheduledDate} />
        {/* Campaign Content */}
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
        {/* Inline Lead Uploader, only for this campaign */}
        <div className="flex flex-col gap-2 border bg-muted/30 rounded-lg p-4 my-4">
          <div className="flex items-center gap-2 font-semibold"><Upload className="h-5 w-5 text-primary" />Upload Recipients (CSV)</div>
          <input
            type="file"
            accept=".csv"
            className="mt-2"
            disabled={uploading}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleCsvUpload(e.target.files[0]);
              }
            }}
          />
          <div className="text-sm text-muted-foreground">
            {uploading && "Uploading..."}
            {!uploading && uploadedLeads.length > 0 && (
              <>
                <strong>{uploadedLeads.length}</strong> recipient{uploadedLeads.length === 1 ? "" : "s"} loaded.
              </>
            )}
            {!uploading && uploadedLeads.length === 0 && "No recipients uploaded yet."}
          </div>
          {uploadedLeads.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 w-max"
              onClick={clearLeads}
              disabled={uploading}
            >
              Remove Uploaded Leads
            </Button>
          )}
          <div className="text-xs text-muted-foreground">
            Upload a CSV file with columns: name, email, phone. Only these uploaded leads will receive this campaign.
          </div>
        </div>
        {/* Submission Button */}
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          )}
          <Button
            onClick={handleStartOrSchedule}
            disabled={!canSubmitCampaign || sending}
          >
            {sending
              ? "Sending Campaign..."
              : scheduledDate
                ? "Schedule Campaign"
                : "Start Campaign"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
