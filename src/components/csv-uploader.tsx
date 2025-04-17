
import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UploadOptions } from "./upload-options";
import { DropZone } from "./csv/drop-zone";
import { FilePreviewCard } from "./csv/file-preview-card";
import { DataPreview } from "./csv/data-preview";
import { parseCSV, validateHeaders, type CsvRow } from "@/utils/csv-parser";

export function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const parseFile = async (file: File) => {
    try {
      setIsUploading(true);
      const text = await file.text();
      const headers = text.split('\n')[0].split(',').map(header => header.trim().toLowerCase());
      
      const missingHeaders = validateHeaders(headers);
      if (missingHeaders.length > 0) {
        toast({
          variant: "destructive",
          title: "Missing required columns",
          description: `Your CSV is missing: ${missingHeaders.join(', ')}`
        });
        return;
      }

      const rows = parseCSV(text, selectedSource, selectedCampaign);
      setParsedData(rows);
      setPreviewVisible(true);
      setIsUploading(false);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        variant: "destructive",
        title: "Parse Error",
        description: "Failed to parse the CSV file"
      });
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!parsedData.length || !user || !selectedSource) {
      toast({
        variant: "destructive",
        title: "Missing Required Fields",
        description: !selectedSource ? "Please select a lead source" : "No valid leads to upload"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Filter out invalid rows
      const validRows = parsedData.filter(row => row.isValid);
      
      if (validRows.length === 0) {
        toast({
          variant: "destructive",
          title: "No Valid Leads",
          description: "No valid leads to upload. Please fix the errors and try again."
        });
        setIsUploading(false);
        return;
      }

      // Prepare data for Supabase
      const leadsToInsert = validRows.map(row => ({
        name: row.name,
        email: row.email,
        phone: row.phone,
        source: selectedSource,
        campaign_id: selectedCampaign || null,
        status: 'new',
        client_id: user.id
      }));
      
      // Insert leads in batches
      const batchSize = 50;
      let successCount = 0;
      let duplicateCount = 0;
      
      for (let i = 0; i < leadsToInsert.length; i += batchSize) {
        const batch = leadsToInsert.slice(i, i + batchSize);
        
        for (const lead of batch) {
          // Check for duplicates
          const { data: existingLeads, error: checkError } = await supabase
            .from('leads')
            .select('id')
            .or(`email.eq.${lead.email},phone.eq.${lead.phone}`)
            .limit(1);
          
          if (checkError) {
            console.error("Error checking for duplicates:", checkError);
            continue;
          }
          
          if (existingLeads && existingLeads.length > 0) {
            duplicateCount++;
            continue;
          }
          
          // Insert new lead
          const { error: insertError } = await supabase.from('leads').insert([lead]);
          
          if (insertError) {
            console.error("Error inserting lead:", insertError);
          } else {
            successCount++;
          }
        }
      }
      
      toast({
        title: "Upload Complete",
        description: `Successfully imported ${successCount} leads. Skipped ${duplicateCount} duplicates. ${parsedData.length - validRows.length} invalid rows.`,
        duration: 5000
      });
      
      // Reset form
      setFile(null);
      setParsedData([]);
      setParseProgress(0);
      setPreviewVisible(false);
      setSelectedSource("");
      setSelectedCampaign("");
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "An unexpected error occurred"
      });
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

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
            onRemove={() => {
              setFile(null);
              setParsedData([]);
              setParseProgress(0);
              setPreviewVisible(false);
            }}
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
