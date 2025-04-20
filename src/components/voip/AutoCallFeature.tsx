
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function AutoCallFeature() {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  };

  const processCSV = async (text: string) => {
    const lines = text.split("\n");
    const headers = lines[0].toLowerCase().split(",");
    const nameIndex = headers.indexOf("name");
    const phoneIndex = headers.indexOf("phone");

    if (nameIndex === -1 || phoneIndex === -1) {
      throw new Error("CSV must include 'name' and 'phone' columns");
    }

    return lines
      .slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(",");
        return {
          name: values[nameIndex].trim(),
          phone: values[phoneIndex].trim(),
        };
      });
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      const leads = await processCSV(text);

      if (leads.length === 0) {
        throw new Error("No valid leads found in CSV");
      }

      const { error } = await supabase.functions.invoke("autocall-batch", {
        body: leads,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Auto Call campaign started!",
      });
      
      // Reset the file input
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (error) {
      console.error("Auto-call error:", error);
      toast({
        title: "Error",
        description: "Failed to trigger Auto Call. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          📂 Upload Leads for Auto-Calling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className={file ? "border-primary" : ""}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleUpload} 
                disabled={!file || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Start Auto Call Campaign"
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload a CSV with name and phone columns to auto-call leads one by one.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
