
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadOptions } from "./upload-options";
import { DropZone } from "./csv/drop-zone";
import { FilePreviewCard } from "./csv/file-preview-card";
import { DataPreview } from "./csv/data-preview";
import { useCSVUpload } from "@/hooks/use-csv-upload";
import { useState } from "react";

export function CSVUploader() {
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  
  const {
    file,
    isUploading,
    parseProgress,
    parsedData,
    previewVisible,
    setFile,
    parseFile,
    handleUpload,
    resetState,
    setPreviewVisible
  } = useCSVUpload({
    selectedSource,
    selectedCampaign
  });

  return (
    <div className="space-y-4">
      <UploadOptions
        source={selectedSource}
        campaignId={selectedCampaign}
        onSourceChange={setSelectedSource}
        onCampaignChange={setSelectedCampaign}
        disabled={isUploading}
      />

      {!file ? (
        <DropZone
          onFileSelect={(selectedFile) => {
            setFile(selectedFile);
            parseFile(selectedFile);
          }}
          isUploading={isUploading}
        />
      ) : (
        <>
          <FilePreviewCard
            file={file}
            rowCount={parsedData.length}
            onRemove={resetState}
            parseProgress={parseProgress}
            isUploading={isUploading}
          />
          
          {parsedData.length > 0 && (
            <>
              <DataPreview
                data={parsedData}
                selectedSource={selectedSource}
                selectedCampaign={selectedCampaign}
                isVisible={previewVisible}
                onToggleVisibility={() => setPreviewVisible(!previewVisible)}
              />
              
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || parsedData.filter(row => row.isValid).length === 0 || !selectedSource}
                  className="w-full"
                >
                  {isUploading ? "Uploading..." : `Upload ${parsedData.filter(row => row.isValid).length} Valid Leads`}
                </Button>
              </div>
              
              <div className="mt-3 text-xs flex flex-wrap gap-2 text-muted-foreground">
                <div className="flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span>Only valid leads will be imported</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  <span>Duplicate leads will be skipped</span>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
