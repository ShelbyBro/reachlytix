
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CampaignDropdown } from "@/components/campaigns/campaign-dropdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderIcon, Plus } from "lucide-react";

export function AgentRequestForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaignId, setCampaignId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "You must be logged in." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("ai_agents").insert([
      {
        campaign_id: campaignId || null,
        notes: notes || null,
        client_id: user.id,
        status: "pending",
      },
    ]);
    setLoading(false);
    if (error) {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Agent requested!",
        description: "Your AI agent request has been submitted.",
      });
      setCampaignId("");
      setNotes("");
    }
  };

  return (
    <form
      className="rounded-xl bg-card shadow px-4 py-6 flex flex-col gap-5 max-w-xl mx-auto"
      onSubmit={handleSubmit}
    >
      <div>
        <CampaignDropdown value={campaignId} onCampaignChange={setCampaignId} />
      </div>
      <div>
        <label htmlFor="notes" className="block mb-2 text-sm font-medium">
          Notes (optional)
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add special requirements, instructions, etc."
        />
      </div>
      <Button type="submit" className="mt-2 w-fit" disabled={loading}>
        {loading ? (
          <>
            <LoaderIcon className="animate-spin mr-2" /> Requesting...
          </>
        ) : (
          <>
            <Plus className="mr-1" /> Request Agent
          </>
        )}
      </Button>
    </form>
  );
}
