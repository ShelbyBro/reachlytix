
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
import { Lender } from "./IsoLenders";

interface LendersTableProps {
  lenders: Lender[];
  isLoading: boolean;
  isAdmin: boolean;
}

export function LendersTable({ lenders, isLoading, isAdmin }: LendersTableProps) {
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
        <p className="text-muted-foreground">No lenders available in the network.</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Interest Rate</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            {isAdmin && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {lenders.map((lender) => (
            <TableRow key={lender.id}>
              <TableCell className="font-medium">{lender.name}</TableCell>
              <TableCell>{lender.interest_rate}%</TableCell>
              <TableCell>{lender.type}</TableCell>
              <TableCell>
                <StatusBadge status={lender.status} />
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <span className="text-primary cursor-pointer">Edit</span>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  
  switch (status.toLowerCase()) {
    case "active":
      variant = "default";
      break;
    case "inactive":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{status}</Badge>;
}
