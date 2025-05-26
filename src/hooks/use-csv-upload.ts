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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // New: holds user's uploaded leads for display
  const [userLeads, setUserLeads] = useState<CsvRow[]>([]);
  const [fetchingLeads, setFetchingLeads] = useState(false);

  // NEW: Track filename, type, and status for Upload History (in-memory for this session; in real app, use DB/audit)
  const [uploadHistory, setUploadHistory] = useState<{ filename: string; type: string; status: string }[]>([]);

  const fetchUserLeads = async () => {
    if (!user) return;
    setFetchingLeads(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading your leads",
        description: error.message,
      });
      setUserLeads([]);
    } else {
      // Map DB rows into CsvRow shape for UI components
      const rows: CsvRow[] = (data ?? []).map((lead: any) => ({
        name: lead.name ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        source: lead.source ?? "",
        isValid: true,
        invalidReason: undefined,
        // Optionally, spread any other fields, e.g. id/status if needed for UI
        ...(lead.id && { id: lead.id }),
        ...(lead.status && { status: lead.status }),
        ...(lead.client_id && { client_id: lead.client_id }),
        ...(lead.created_at && { created_at: lead.created_at }),
      }));
      setUserLeads(rows);
    }
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
      // After successful preview:
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

      // Tip: never include created_by in payload, let Supabase default handle it and RLS will succeed.
      const leadsToInsert = validRows.map(row => ({
        name: row.name,
        email: row.email,
        phone: row.phone,
        source: selectedSource,
        status: 'new',
        client_id: user.id
        // DO NOT specify created_by here!
      }));

      const batchSize = 50;
      let successCount = 0;
      let duplicateCount = 0;
      let dbError: string | null = null;

      for (let i = 0; i < leadsToInsert.length; i += batchSize) {
        const batch = leadsToInsert.slice(i, i + batchSize);

        for (const lead of batch) {
          // Check for duplicate by email or phone for this client
          const { data: existingLeads, error: checkError } = await supabase
            .from('leads')
            .select('id')
            .or(`email.eq.${lead.email},phone.eq.${lead.phone}`)
            .eq('client_id', user.id)
            .limit(1);

          if (checkError) {
            console.error("Error checking for duplicates:", checkError);
            dbError = checkError.message;
            continue;
          }

          if (existingLeads && existingLeads.length > 0) {
            duplicateCount++;
            continue;
          }

          // Only insert allowed fields, do NOT include created_by, not even as undefined/null
          const { error: insertError } = await supabase.from('leads').insert([lead]);

          if (insertError) {
            console.error("Error inserting lead:", insertError);
            dbError = insertError.message;
          } else {
            successCount++;
          }
        }
      }

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
        await fetchUserLeads();
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
    fetchUserLeads,
    fetchingLeads,
    uploadHistory // Exposed for Upload History component (include filename, type, status)
  };
}
