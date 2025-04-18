
import { Input } from "@/components/ui/input";

interface CampaignDetailsFieldsProps {
  campaignName: string;
  description: string;
  onCampaignNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function CampaignDetailsFields({
  campaignName,
  description,
  onCampaignNameChange,
  onDescriptionChange
}: CampaignDetailsFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="campaignName">Campaign Name</label>
        <Input
          id="campaignName"
          placeholder="Campaign Name"
          value={campaignName}
          onChange={(e) => onCampaignNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="description">Description (Optional)</label>
        <Input
          id="description"
          placeholder="Campaign Description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
    </>
  );
}
