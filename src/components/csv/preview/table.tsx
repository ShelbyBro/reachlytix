
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
import { Check, X } from "lucide-react";

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

interface PreviewTableProps {
  data: CsvRow[];
  selectedSource: string;
  selectedCampaign: string;
}

export function PreviewTable({ data, selectedSource, selectedCampaign }: PreviewTableProps) {
  return (
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
              <TableCell>
                {row.email || <span className="text-destructive text-xs">Missing</span>}
              </TableCell>
              <TableCell>
                {row.phone || <span className="text-destructive text-xs">Missing</span>}
              </TableCell>
              <TableCell>{selectedSource || row.source}</TableCell>
              {selectedCampaign && <TableCell>Yes</TableCell>}
            </TableRow>
          ))}
          {data.length > 5 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-xs text-muted-foreground py-2"
              >
                {data.length - 5} more rows not shown in preview
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
