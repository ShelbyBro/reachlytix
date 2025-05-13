
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Lender } from "@/types/iso";

interface LendersTableProps {
  lenders: Lender[];
  isLoading: boolean;
}

export function LendersTable({ lenders, isLoading }: LendersTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading lenders...</span>
      </div>
    );
  }
  
  if (lenders.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No lenders available. Please contact support.</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Loan Type</TableHead>
            <TableHead>Interest Rate</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lenders.map((lender) => (
            <TableRow key={lender.id}>
              <TableCell className="font-medium">{lender.name}</TableCell>
              <TableCell>{lender.type}</TableCell>
              <TableCell>{lender.interest_rate}%</TableCell>
              <TableCell>
                <StatusBadge status={lender.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" = "default";
  
  switch (status.toLowerCase()) {
    case "active":
      variant = "success";
      break;
    case "pending":
      variant = "secondary";
      break;
    case "inactive":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{status}</Badge>;
}
