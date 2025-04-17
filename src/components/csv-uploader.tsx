
import { UploadOptions } from "./upload-options";
import { DropZone } from "./csv/drop-zone";
import { FilePreviewCard } from "./csv/file-preview-card";
import { DataPreview } from "./csv/preview/data-preview";
import { UploadActions } from "./csv/upload-actions";
import { LeadValidationStatus } from "./csv/lead-validation-status";
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
              
              <UploadActions
                isUploading={isUploading}
                validLeadsCount={parsedData.filter(row => row.isValid).length}
                onUpload={handleUpload}
                disabled={!selectedSource}
              />
              
              <LeadValidationStatus />
            </>
          )}
        </>
      )}
    </div>
  );
}
