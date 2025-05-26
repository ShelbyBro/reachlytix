
import { useCSVUpload } from "@/hooks/use-csv-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useEffect } from "react";
import { FileSpreadsheet } from "lucide-react";

/**
 * Upload leads inline on the campaign form.
 * On successful upload, calls `onLeadsUploaded` to refresh the lead list.
 * Usable inside a Modal or tab.
 */
export function InlineLeadUploader({
  onLeadsUploaded,
}: {
  onLeadsUploaded?: () => void;
}) {
  const {
    file,
    setFile,
    parseFile,
    isUploading,
    parseProgress,
    previewVisible,
    uploadError,
    handleUpload,
    resetState,
    parsedData,
  } = useCSVUpload({ selectedSource: "manual", selectedCampaign: "" });

  // After successful upload, reset + callback
  useEffect(() => {
    if (!isUploading && previewVisible === false && file === null && onLeadsUploaded) {
      onLeadsUploaded();
    }
    // eslint-disable-next-line
  }, [isUploading, previewVisible, file]);

  return (
    <div>
      <div className="mb-2 font-semibold text-primary">Upload Leads CSV</div>
      <div className="border-2 border-dashed rounded-md border-muted p-4 flex flex-col items-center">
        {!file ? (
          <>
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <FileSpreadsheet className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">Drag & drop, or click to upload</span>
              <Input
                type="file"
                accept=".csv"
                className="max-w-xs mx-auto mt-1"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    parseFile(e.target.files[0]);
                  }
                }}
              />
            </label>
          </>
        ) : (
          <div className="space-y-2 w-full">
            <div className="flex justify-between items-center gap-3">
              <span className="text-sm">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={resetState}
                disabled={isUploading}
              >
                Remove
              </Button>
            </div>
            {uploadError && <div className="text-xs text-red-500">{uploadError}</div>}
            {isUploading && (
              <div>
                <Progress value={parseProgress} className="h-2" />
                <div className="text-right text-xs text-muted-foreground">{Math.round(parseProgress)}%</div>
              </div>
            )}
          </div>
        )}
      </div>
      {parsedData.length > 0 && (
        <div className="text-xs mt-3 mb-1 text-muted-foreground">
          {parsedData.length} row(s) parsed. Only valid, deduplicated leads are saved.
        </div>
      )}
      <Button
        className="mt-3"
        disabled={!file || isUploading}
        onClick={() => handleUpload()}
        type="button"
        variant="default"
      >
        {isUploading ? "Uploading..." : "Upload Leads"}
      </Button>
      <div className="text-xs text-muted-foreground mt-2">
        Required columns: name, email, phone. Max size: 10MB.
      </div>
    </div>
  );
}
