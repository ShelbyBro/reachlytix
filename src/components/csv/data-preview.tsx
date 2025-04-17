
import { Eye, ChevronUp, ChevronDown, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CsvRow {
  [key: string]: string | boolean | undefined;
  name: string;
  email: string;
  phone: string;
  source: string;
  campaign_id?: string;
  isValid: boolean;
  invalidReason?: string;
}

interface DataPreviewProps {
  data: CsvRow[];
  selectedSource: string;
  selectedCampaign: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function DataPreview({
  data,
  selectedSource,
  selectedCampaign,
  isVisible,
  onToggleVisibility,
}: DataPreviewProps) {
  return (
    <div className="mt-4">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onToggleVisibility}
        className="mb-2 text-xs flex items-center gap-1"
      >
        <Eye className="h-3.5 w-3.5" />
        {isVisible ? "Hide Preview" : "Show Preview"} 
        {isVisible ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>
      
      {isVisible && (
        <div className="border rounded-md overflow-auto max-h-60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Source</TableHead>
                {selectedCampaign && <TableHead>Campaign</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 5).map((row, index) => (
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
                  <TableCell>{selectedSource || row.source}</TableCell>
                  {selectedCampaign && <TableCell>Yes</TableCell>}
                </TableRow>
              ))}
              {data.length > 5 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-2">
                    {data.length - 5} more rows not shown in preview
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
            {data.filter(row => row.isValid).length} Valid
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1">
            <X className="h-3.5 w-3.5 text-destructive" />
            {data.filter(row => !row.isValid).length} Invalid
          </Badge>
        </div>
      </div>
    </div>
  );
}
