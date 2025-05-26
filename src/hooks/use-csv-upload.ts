import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parseCSV, validateHeaders, type CsvRow } from "./csv-parse-utils";
import { fetchUserLeads, insertBatchLeads } from "./csv-lead-db";
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // New: holds user's uploaded leads for display
  const [userLeads, setUserLeads] = useState<CsvRow[]>([]);
  const [fetchingLeads, setFetchingLeads] = useState(false);

  // NEW: Track filename, type, and status for Upload History (in-memory for this session; in real app, use DB/audit)
  const [uploadHistory, setUploadHistory] = useState<{ filename: string; type: string; status: string }[]>([]);

  const fetchUserLeadsWrapper = async () => {
    if (!user) return;
    setFetchingLeads(true);
    const rows = await fetchUserLeads(user.id, toast);
    setUserLeads(rows);
    setFetchingLeads(false);
  };

  const parseFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
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
        setUploadError("Missing required columns.");
        return;
      }
      const rows = parseCSV(text, selectedSource, selectedCampaign);
      setParsedData(rows);
      setPreviewVisible(true);
      setIsUploading(false);
      setUploadHistory(h => [
        ...h,
        { filename: file.name, type: "csv", status: "Parsed" }
      ]);
    } catch (error: any) {
      console.error("Error parsing file:", error);
      toast({
        variant: "destructive",
        title: "Parse Error",
        description: "Failed to parse the CSV file"
      });
      setUploadError("Parse error: " + error.message);
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    setUploadError(null);
    if (!parsedData.length || !user || !selectedSource) {
      toast({
        variant: "destructive",
        title: "Missing Required Fields",
        description: !selectedSource ? "Please select a lead source" : "No valid leads to upload"
      });
      setUploadError("Please select a source and have at least one valid lead.");
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
        setUploadError("No valid leads to upload.");
        setIsUploading(false);
        return;
      }
      // Prepare data for DB
      const leadsToInsert = validRows.map(row => ({
        name: row.name,
        email: row.email,
        phone: row.phone,
        source: selectedSource,
        status: 'new',
        client_id: user.id
      }));
      const result = await insertBatchLeads(leadsToInsert, user.id, selectedSource, 50, toast);
      const { successCount, duplicateCount, dbError } = result;
      if (dbError) {
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: dbError
        });
        setUploadError("Database error: " + dbError);
      } else {
        toast({
          title: "Upload Complete",
          description: `Imported ${successCount} leads. Skipped ${duplicateCount} duplicates.`
        });
        await fetchUserLeadsWrapper();
        resetState();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "An unexpected error occurred"
      });
      setUploadError("Unexpected error: " + error.message);
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
    setUploadError(null);
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
    setPreviewVisible,
    uploadError,
    userLeads,
    fetchUserLeads: fetchUserLeadsWrapper,
    fetchingLeads,
    uploadHistory // Exposed for Upload History component (include filename, type, status)
  };
}
