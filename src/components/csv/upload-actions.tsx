
import { Button } from "@/components/ui/button";

interface UploadActionsProps {
  isUploading: boolean;
  validLeadsCount: number;
  onUpload: () => void;
  disabled: boolean;
}

export function UploadActions({
  isUploading,
  validLeadsCount,
  onUpload,
  disabled
}: UploadActionsProps) {
  return (
    <div className="mt-4">
      <Button
        onClick={onUpload}
        disabled={disabled || isUploading || validLeadsCount === 0}
        className="w-full"
      >
        {isUploading ? "Uploading..." : `Upload ${validLeadsCount} Valid Leads`}
      </Button>
    </div>
  );
}
