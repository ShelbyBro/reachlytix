
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { SimpleCampaign } from "@/types/campaign";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

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
  const { toast } = useToast();
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (editingCampaign) {
      setCampaignName(editingCampaign.title || "");
      setDescription(editingCampaign.description || "");
      if (editingCampaign.scheduled_at) {
        setScheduledDate(new Date(editingCampaign.scheduled_at));
      }
      
      // Fetch script content if available
      if (editingCampaign.script_id) {
        fetchScript(editingCampaign.script_id);
      }
    }
  }, [editingCampaign]);

  const fetchScript = async (scriptId: string) => {
    const { data: script, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", scriptId)
      .single();

    if (error) {
      console.error("Error fetching script:", error);
      return;
    }

    if (script) {
      setSubject(script.title || "");
      setContent(script.content || "");
    }
  };

  const handleSave = async () => {
    try {
      if (!campaignName || !subject || !content) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill out all required fields."
        });
        return;
      }

      if (editingCampaign) {
        // Update existing campaign
        const { error: scriptError } = await supabase
          .from("scripts")
          .update({
            title: subject,
            content: content,
          })
          .eq("id", editingCampaign.script_id);

        if (scriptError) throw scriptError;

        const { error: campaignError } = await supabase
          .from("campaigns")
          .update({
            title: campaignName,
            description: description,
            scheduled_at: scheduledDate?.toISOString(),
          })
          .eq("id", editingCampaign.id);

        if (campaignError) throw campaignError;

        toast({
          title: "Campaign updated",
          description: "Your campaign has been updated successfully."
        });
      } else {
        // Create new campaign
        const { data: scriptData, error: scriptError } = await supabase
          .from("scripts")
          .insert({
            title: subject,
            content: content,
            type: "email"
          })
          .select();

        if (scriptError) throw scriptError;
        
        const newScript = scriptData[0];

        const { error: campaignError } = await supabase
          .from("campaigns")
          .insert({
            title: campaignName,
            description: description,
            status: "draft",
            type: "email",
            script_id: newScript.id,
            scheduled_at: scheduledDate?.toISOString(),
          })
          .select();

        if (campaignError) throw campaignError;

        toast({
          title: "Campaign created",
          description: "Your campaign has been created successfully."
        });
      }

      // Clear form
      setCampaignName("");
      setSubject("");
      setContent("");
      setDescription("");
      setScheduledDate(undefined);
      
      // Notify parent to refresh campaigns list
      onCampaignCreated();
      if (onCancel) onCancel();
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save campaign."
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingCampaign ? "Edit Campaign" : "Create New Campaign"}</CardTitle>
        <CardDescription>
          {editingCampaign 
            ? "Update your campaign information and email content below." 
            : "Enter your campaign information and email content below."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="campaignName">Campaign Name</label>
          <Input
            id="campaignName"
            placeholder="Campaign Name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">Description (Optional)</label>
          <Input
            id="description"
            placeholder="Campaign Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="subject">Email Subject</label>
          <Input
            id="subject"
            placeholder="Email Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="content">Email Content</label>
          <Textarea
            id="content"
            rows={8}
            placeholder="Email Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Schedule (Optional)</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !scheduledDate && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduledDate ? format(scheduledDate, "PPP") : "Schedule campaign"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

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
