
import { useLeadGenerator } from "@/hooks/use-lead-generator";
import { DropZone } from "../csv/drop-zone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function LeadGeneratorPanel() {
  const { leads, isProcessing, processLeads } = useLeadGenerator();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DropZone
          onFileSelect={(file) => processLeads([file])}
          isUploading={isProcessing}
          accept=".csv"
          multiple
        />

        {leads.length > 0 && (
          <div className="mt-6 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.slice(0, 10).map((lead, index) => (
                  <TableRow key={index}>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {leads.length > 10 && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing 10 of {leads.length} leads
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
