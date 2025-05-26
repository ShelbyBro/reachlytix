
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CampaignDetailsView } from "@/components/campaigns/CampaignDetailsView";
import EmailCampaignDetails from "@/components/campaigns/EmailCampaignDetails";
import { SimpleCampaign } from "@/types/campaign";
import { Loader2 } from "lucide-react";

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<SimpleCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaign() {
      setLoading(true);
      setFetchError(null);
      if (!id) {
        setFetchError("No campaign ID in URL.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        setFetchError(error.message || "Unknown error from DB.");
        setCampaign(null);
      } else if (!data) {
        setFetchError("No data returned for this campaign ID.");
        setCampaign(null);
      } else {
        setCampaign(data as SimpleCampaign);
      }
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
        <div className="text-lg font-bold mb-2">Campaign not found or you do not have access.</div>
        {fetchError && (
          <div className="text-xs mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 break-all">
            {fetchError}
          </div>
        )}
      </div>
    );
  }

  // Show EmailCampaignDetails for email campaigns
  if (campaign.type === "email") {
    return <EmailCampaignDetails campaign={campaign} />;
  }

  // Fallback to default details view for other types
  return <CampaignDetailsView campaign={campaign} />;
}
