
import { useState } from "react";
import { Upload, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const { toast } = useToast();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type !== 'text/csv') {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV file"
      });
      return;
    }
    
    setFile(droppedFile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'text/csv') {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV file"
      });
      return;
    }
    
    setFile(selectedFile);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
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
    
    const leads = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      const lead: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        lead[header] = values[index] || '';
      });
      
      lead.status = 'new';
      leads.push(lead);
      
      // Update progress
      setParseProgress(Math.floor((i / (lines.length - 1)) * 100));
    }
    
    return leads;
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      const text = await file.text();
      const leads = parseCSV(text);
      
      if (!leads) {
        setIsUploading(false);
        return;
      }
      
      // Insert leads in batches to avoid payload size limits
      const batchSize = 100;
      let successCount = 0;
      
      for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        const { error } = await supabase.from('leads').insert(batch);
        
        if (error) {
          console.error("Error uploading batch:", error);
          toast({
            variant: "destructive",
            title: "Upload Error",
            description: `Error on batch ${i/batchSize + 1}: ${error.message}`
          });
        } else {
          successCount += batch.length;
        }
      }
      
      toast({
        title: "Upload Complete",
        description: `Successfully imported ${successCount} leads`,
        duration: 5000
      });
      
      setFile(null);
      setParseProgress(0);
      
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
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFile(null);
                setParseProgress(0);
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
          
          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload Leads"}
            </Button>
          </div>
          
          <div className="mt-3 text-xs flex items-center text-muted-foreground">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>Duplicate leads (same email) will be skipped</span>
          </div>
        </Card>
      )}
    </div>
  );
}
