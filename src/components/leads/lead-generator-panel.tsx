
import { useState } from "react";
import { useLeadGenerator } from "@/hooks/use-lead-generator";
import { DropZone } from "../csv/drop-zone";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualLeadForm } from "./manual-lead-form";
import { toast } from "sonner";

export function LeadGeneratorPanel() {
  const { 
    leads, 
    isProcessing, 
    processLeads, 
    addManualLead, 
    deleteLead 
  } = useLeadGenerator();
  const [activeTab, setActiveTab] = useState("upload");

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteLead(id);
      toast.success("Lead deleted successfully");
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Generator</CardTitle>
        <CardDescription>
          Upload CSV files or manually add leads to your database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            <TabsTrigger value="manual">Add Manually</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="pt-4">
            <DropZone
              onFileSelect={(file) => processLeads([file])}
              isUploading={isProcessing}
              accept=".csv"
              multiple
            />
          </TabsContent>
          
          <TabsContent value="manual" className="pt-4">
            <ManualLeadForm 
              onSubmit={addManualLead} 
              isSubmitting={isProcessing} 
            />
          </TabsContent>
        </Tabs>

        {leads.length > 0 && (
          <div className="mt-6 overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium">Your Leads</h3>
              <span className="text-sm text-muted-foreground">
                Total: {leads.length} leads
              </span>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Badge 
                        variant={
                          lead.status === 'valid' 
                            ? 'default' 
                            : lead.status === 'invalid' 
                              ? 'destructive' 
                              : 'secondary'
                        }
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLead(lead.id)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
