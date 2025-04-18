
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface CreateCampaignFormProps {
  onCampaignCreated: () => void;
}

export function CreateCampaignForm({ onCampaignCreated }: CreateCampaignFormProps) {
  const { toast } = useToast();
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleCreateCampaign = async () => {
    try {
      if (!campaignName || !subject || !content) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill out all fields."
        });
        return;
      }

      // First create a script
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

      // Then create the campaign linked to the script
      const { error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          title: campaignName,
          status: "draft",
          type: "email",
          script_id: newScript.id
        })
        .select();

      if (campaignError) throw campaignError;

      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully."
      });

      // Clear form
      setCampaignName("");
      setSubject("");
      setContent("");
      
      // Notify parent to refresh campaigns list
      onCampaignCreated();
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create campaign."
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Campaign Name"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
        />
        <Input
          placeholder="Email Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <Textarea
          rows={8}
          placeholder="Email Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button onClick={handleCreateCampaign}>Create Campaign</Button>
      </CardContent>
    </Card>
  );
}
