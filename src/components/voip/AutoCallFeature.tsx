
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
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    
    // Handle empty file
    if (lines.length === 0) {
      throw new Error("CSV file is empty");
    }
    
    // Get headers and find name and phone indices
    const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
    const nameIndex = headers.findIndex(h => h === "name");
    const phoneIndex = headers.findIndex(h => h === "phone");

    if (nameIndex === -1 || phoneIndex === -1) {
      throw new Error("CSV must include 'name' and 'phone' columns");
    }

    return lines
      .slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(",").map(v => v.trim());
        return {
          name: values[nameIndex],
          phone: values[phoneIndex],
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
      // Get the file content as text
      const fileContent = await file.text();
      
      // Process the CSV content to extract leads
      const leads = await processCSV(fileContent);
      
      if (leads.length === 0) {
        throw new Error("No valid leads found in CSV");
      }
      
      // Get the current session for the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error("No authentication token available. Please log in again.");
      }

      // Send the leads to the autocall-batch edge function
      const response = await fetch("https://szkhnwedzwvlqlktgvdp.supabase.co/functions/v1/autocall-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(leads),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error || response.statusText}`);
      }

      toast({
        title: "Success",
        description: `Auto Call campaign started with ${leads.length} leads!`,
      });
      
      // Reset the file input
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (error) {
      console.error("Auto-call error:", error);
      toast({
        title: "Error",
        description: `Failed to trigger Auto Call: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a separate test function that can be used for direct testing
  const testAutocall = async () => {
    setIsLoading(true);
    try {
      const testData = [
        { name: "Test Lead", phone: "+8801841984046" }
      ];

      // Get the current session for the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error("No authentication token available. Please log in again.");
      }

      const response = await fetch("https://szkhnwedzwvlqlktgvdp.supabase.co/functions/v1/autocall-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error || response.statusText}`);
      }

      toast({
        title: "Test Successful",
        description: "Auto Call test was successful!",
      });
    } catch (error) {
      console.error("Test auto-call error:", error);
      toast({
        title: "Test Error",
        description: `Failed to test Auto Call: ${error instanceof Error ? error.message : "Unknown error"}`,
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
        <div className="flex flex-col space-y-2">
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
          
          <Button 
            onClick={testAutocall}
            variant="outline"
            disabled={isLoading}
          >
            Test Function With Sample Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
