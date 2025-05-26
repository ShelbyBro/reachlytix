
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parseCSV, validateHeaders, type CsvRow } from "@/utils/csv-parser";
import { useAuth } from "@/contexts/AuthContext";

interface UseCSVUploadOptions {
  selectedSource: string;
  selectedCampaign: string;
}

export function useCSVUpload({ selectedSource, selectedCampaign }: UseCSVUploadOptions) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
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
        setIsUploading(false);
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

      // Always set client_id to the logged-in user's id!
      const leadsToInsert = validRows.map(row => ({
        name: row.name,
        email: row.email,
        phone: row.phone,
        source: selectedSource,
        status: 'new',
        client_id: user.id
      }));
      
      const batchSize = 50;
      let successCount = 0;
      let duplicateCount = 0;
      
      for (let i = 0; i < leadsToInsert.length; i += batchSize) {
        const batch = leadsToInsert.slice(i, i + batchSize);
        
        for (const lead of batch) {
          const { data: existingLeads, error: checkError } = await supabase
            .from('leads')
            .select('id')
            .or(`email.eq.${lead.email},phone.eq.${lead.phone}`)
            .eq('client_id', user.id)
            .limit(1);
          
          if (checkError) {
            console.error("Error checking for duplicates:", checkError);
            continue;
          }
          
          if (existingLeads && existingLeads.length > 0) {
            duplicateCount++;
            continue;
          }
          
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
      
      resetState();
      
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

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setParseProgress(0);
    setPreviewVisible(false);
  };

  return {
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
  };
}

