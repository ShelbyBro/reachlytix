
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CampaignDetailsView } from "@/components/campaigns/CampaignDetailsView";
import { SimpleCampaign } from "@/types/campaign";
import { Loader2 } from "lucide-react";

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<SimpleCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaign() {
      setLoading(true);
      if (!id) return;
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) setCampaign(data as SimpleCampaign);
      setLoading(false);
    }
    fetchCampaign();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin mb-2" /> Loading campaign details...
      </div>
    );
  }
  if (!campaign) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Campaign not found or you do not have access.
      </div>
    );
  }
  return <CampaignDetailsView campaign={campaign} />;
}
