import { StartCampaignButton } from "./StartCampaignButton";
import { SimpleCampaign } from "@/types/campaign";

type CampaignDetailsViewProps = {
  campaign: SimpleCampaign;
  // ...other props...
  onCampaignSent?: () => void;
};

export function CampaignDetailsView({ campaign, onCampaignSent }: CampaignDetailsViewProps) {
  // ... display campaign info ...
  return (
    <div>
      {/* ... campaign fields ... */}
      {campaign.status !== "sent" && (
        <div className="my-4">
          <StartCampaignButton campaignId={campaign.id} onSuccess={onCampaignSent} />
        </div>
      )}
      {/* ... rest of details ... */}
    </div>
  );
}
