
import { useState, useRef } from "react";
import { Upload, X, Check, AlertCircle, Eye, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CsvRow {
  [key: string]: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  isValid: boolean;
  invalidReason?: string;
}

export function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type !== 'text/csv' && !droppedFile?.name.endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV file"
      });
      return;
    }
    
    setFile(droppedFile);
    parseFile(droppedFile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV file"
      });
      return;
    }
    
    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    try {
      setIsUploading(true);
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (!rows) {
        setIsUploading(false);
        return;
      }

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

  const parseCSV = (text: string): CsvRow[] | null => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    // Check for required headers
    const requiredHeaders = ['name', 'email', 'phone', 'source'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      toast({
        variant: "destructive",
        title: "Missing required columns",
        description: `Your CSV is missing: ${missingHeaders.join(', ')}`
      });
      return null;
    }
    
    const rows: CsvRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      const row: Partial<CsvRow> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate row
      const isValid = Boolean(row.email && row.phone);
      let invalidReason = '';
      
      if (!row.email && !row.phone) {
        invalidReason = 'Missing both email and phone';
      } else if (!row.email) {
        invalidReason = 'Missing email';
      } else if (!row.phone) {
        invalidReason = 'Missing phone';
      }
      
      rows.push({
        name: row.name || '',
        email: row.email || '',
        phone: row.phone || '',
        source: row.source || '',
        isValid,
        invalidReason
      });
      
      // Update progress
      setParseProgress(Math.floor((i / (lines.length - 1)) * 100));
    }
    
    return rows;
  };

  const handleUpload = async () => {
    if (!parsedData.length || !user) return;
    
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
        source: row.source,
        status: 'new',
        client_id: user.id
      }));
      
      // Insert leads in batches to avoid payload size limits
      const batchSize = 50;
      let successCount = 0;
      let duplicateCount = 0;
      
      for (let i = 0; i < leadsToInsert.length; i += batchSize) {
        const batch = leadsToInsert.slice(i, i + batchSize);
        
        // Check for duplicates before inserting
        for (const lead of batch) {
          // Check if lead with this email or phone already exists
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
      
      setFile(null);
      setParsedData([]);
      setParseProgress(0);
      setPreviewVisible(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
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

  const togglePreview = () => {
    setPreviewVisible(!previewVisible);
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-primary bg-primary/10" : "border-border"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">
            Drop your CSV file here, or{" "}
            <label className="text-primary cursor-pointer hover:underline">
              browse
              <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleChange}
              />
            </label>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            CSV should include: name, email, phone, source
          </p>
        </div>
      ) : (
        <Card className="p-4 border border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded mr-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB • {parsedData.length} rows
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFile(null);
                setParsedData([]);
                setParseProgress(0);
                setPreviewVisible(false);
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {isUploading && (
            <div className="mt-4">
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${parseProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Processing... {parseProgress}%
              </p>
            </div>
          )}
          
          {/* Data Preview */}
          {parsedData.length > 0 && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={togglePreview}
                className="mb-2 text-xs flex items-center gap-1"
              >
                <Eye className="h-3.5 w-3.5" />
                {previewVisible ? "Hide Preview" : "Show Preview"} 
                {previewVisible ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
              
              {previewVisible && (
                <div className="border rounded-md overflow-auto max-h-60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 5).map((row, index) => (
                        <TableRow key={index} className={!row.isValid ? "bg-destructive/10" : ""}>
                          <TableCell>
                            {row.isValid ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <X className="h-4 w-4 text-destructive" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{row.invalidReason}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.email || (
                            <span className="text-destructive text-xs">Missing</span>
                          )}</TableCell>
                          <TableCell>{row.phone || (
                            <span className="text-destructive text-xs">Missing</span>
                          )}</TableCell>
                          <TableCell>{row.source}</TableCell>
                        </TableRow>
                      ))}
                      {parsedData.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-2">
                            {parsedData.length - 5} more rows not shown in preview
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    {parsedData.filter(row => row.isValid).length} Valid
                  </Badge>
                  
                  <Badge variant="outline" className="flex items-center gap-1">
                    <X className="h-3.5 w-3.5 text-destructive" />
                    {parsedData.filter(row => !row.isValid).length} Invalid
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading || parsedData.filter(row => row.isValid).length === 0}
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
        </Card>
      )}
    </div>
  );
}
