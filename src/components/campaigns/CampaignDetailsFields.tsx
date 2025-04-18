
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

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
  const { role } = useAuth();
  const isReadOnly = role === "agent"; // Agents can view but not edit

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="campaignName">Campaign Name</label>
        <Input
          id="campaignName"
          placeholder="Campaign Name"
          value={campaignName}
          onChange={(e) => onCampaignNameChange(e.target.value)}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-muted" : ""}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="description">Description (Optional)</label>
        <Input
          id="description"
          placeholder="Campaign Description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-muted" : ""}
        />
      </div>
    </>
  );
}
