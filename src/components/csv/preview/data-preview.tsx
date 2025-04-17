
import { Eye, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewTable } from "./table";

interface CsvRow {
  [key: string]: string | boolean | undefined;
  name: string;
  email: string;
  phone: string;
  source: string;
  campaign_id?: string;
  isValid: boolean;
  invalidReason?: string;
}

interface DataPreviewProps {
  data: CsvRow[];
  selectedSource: string;
  selectedCampaign: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function DataPreview({
  data,
  selectedSource,
  selectedCampaign,
  isVisible,
  onToggleVisibility,
}: DataPreviewProps) {
  return (
    <div className="mt-4">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onToggleVisibility}
        className="mb-2 text-xs flex items-center gap-1"
      >
        <Eye className="h-3.5 w-3.5" />
        {isVisible ? "Hide Preview" : "Show Preview"} 
        {isVisible ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>
      
      {isVisible && (
        <PreviewTable
          data={data}
          selectedSource={selectedSource}
          selectedCampaign={selectedCampaign}
        />
      )}
    </div>
  );
}
