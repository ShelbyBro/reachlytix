import React, { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Upload as UploadIcon, FileSpreadsheet, FileCheck, AlertTriangle } from "lucide-react";
import { useCSVUpload } from "@/hooks/use-csv-upload";

function UploadedLeadsList({ leads, fetching }: { leads: any[], fetching: boolean }) {
  if (fetching) return <div className="text-sm text-muted-foreground py-6">Loading your leads...</div>;
  if (leads.length === 0) return <div className="text-sm text-muted-foreground italic py-4">No leads uploaded yet.</div>;
  return (
    <div className="mt-2 rounded bg-muted/40 p-2 max-h-56 overflow-y-auto">
      <div className="text-xs font-medium mb-1 text-muted-foreground">Last 10 Uploaded Leads</div>
      <div className="grid grid-cols-3 gap-2 font-semibold text-xs text-muted-foreground border-b pb-1 mb-1">
        <div>Name</div><div>Email</div><div>Phone</div>
      </div>
      {leads.slice(0,10).map((lead) =>
        <div key={lead.id} className="grid grid-cols-3 gap-2 text-xs py-1 border-b border-muted">
          <span>{lead.name}</span>
          <span>{lead.email}</span>
          <span>{lead.phone}</span>
        </div>
      )}
    </div>
  );
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadType, setUploadType] = useState("leads");
  // Use the CSV upload hook for "leads" only
  const {
    file: csvFile,
    isUploading,
    parseProgress,
    parsedData,
    previewVisible,
    setFile: setCsvFile,
    parseFile,
    handleUpload,
    resetState,
    setPreviewVisible,
    uploadError,
    userLeads,
    fetchUserLeads,
    fetchingLeads
  } = useCSVUpload({ selectedSource: "manual", selectedCampaign: "" });

  // Load user leads on mount so users always see what's already uploaded
  useEffect(() => {
    fetchUserLeads();
    // eslint-disable-next-line
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSimulated = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a CSV file to upload.",
      });
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: "Please upload a CSV file.",
      });
      return;
    }

    setUploading(true);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prevProgress + 5;
      });
    }, 200);

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setFile(null);
        setProgress(0);
        toast({
          title: "Upload complete",
          description: "Your file has been uploaded and processed.",
        });
      }, 500);
    }, 3000);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Upload</h1>
          <p className="text-muted-foreground">
            Upload CSV files for leads, campaigns, or other data.
          </p>
        </div>
        
        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="history">Upload History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Data</CardTitle>
                <CardDescription>
                  Upload CSV files with your data for importing into the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  value={uploadType}
                  onValueChange={setUploadType}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="leads" id="leads" />
                    <Label htmlFor="leads">Leads</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="campaigns" id="campaigns" />
                    <Label htmlFor="campaigns">Campaigns</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
                
                <div className="border-2 border-dashed rounded-md border-muted p-6 flex flex-col items-center justify-center">
                  {!csvFile ? (
                    <>
                      <UploadIcon className="mb-4 h-10 w-10 text-muted-foreground" />
                      <div className="text-center space-y-2">
                        <h3 className="font-medium">Drag and drop your file here</h3>
                        <p className="text-sm text-muted-foreground">
                          Or click to browse your files
                        </p>
                        <Input 
                          type="file" 
                          accept=".csv" 
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setCsvFile(e.target.files[0]);
                              parseFile(e.target.files[0]);
                            }
                          }}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 w-full">
                      <div className="flex items-center space-x-3">
                        <FileSpreadsheet className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{csvFile.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(csvFile.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={resetState}
                        >
                          Remove
                        </Button>
                      </div>
                      {/* Upload error */}
                      {uploadError && (
                        <div className="text-xs text-red-500">
                          {uploadError}
                        </div>
                      )}
                      {isUploading && (
                        <div className="space-y-2">
                          <Progress value={parseProgress} className="h-2" />
                          <div className="text-xs text-muted-foreground text-right">
                            {Math.round(parseProgress)}% complete
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!csvFile || isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload File"}
                  </Button>
                </div>
                {/* Immediate display of user leads (if leads tab selected or after upload) */}
                <UploadedLeadsList leads={userLeads} fetching={fetchingLeads} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upload Instructions</CardTitle>
                <CardDescription>
                  Follow these guidelines for a successful import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="text-sm">
                      <h4 className="font-medium">Important Notes</h4>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                        <li>File must be in CSV format</li>
                        <li>First row should contain column headers</li>
                        <li>Required columns: name, email, phone</li>
                        <li>Maximum file size: 10MB</li>
                        <li>Phone numbers should be in E.164 format (+12345678901)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Sample CSV Format</h3>
                  <div className="bg-muted rounded-md p-2 overflow-x-auto">
                    <code className="text-xs">
                      name,email,phone,source<br />
                      John Doe,john@example.com,+12025550108,website<br />
                      Jane Smith,jane@example.com,+12025550145,referral
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload History</CardTitle>
                <CardDescription>
                  View your recent file uploads and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 py-3 px-4 font-medium border-b">
                    <div>Filename</div>
                    <div>Type</div>
                    <div>Date</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                  
                  <div className="grid grid-cols-5 py-3 px-4 border-b items-center">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="h-4 w-4 text-primary" />
                      <span>leads_may_2025.csv</span>
                    </div>
                    <div>Leads</div>
                    <div>May 10, 2025</div>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Complete
                      </span>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 py-3 px-4 items-center">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="h-4 w-4 text-primary" />
                      <span>campaign_data.csv</span>
                    </div>
                    <div>Campaigns</div>
                    <div>May 5, 2025</div>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Complete
                      </span>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// Note: This file is now above 276 lines.
// Suggest refactoring into smaller component files soon.
