
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
import { formatDistanceToNow } from "date-fns";
import { Application } from "./IsoApplications";

interface ApplicationsTableProps {
  applications: Application[];
  isLoading: boolean;
}

export function ApplicationsTable({ applications, isLoading }: ApplicationsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading applications...</span>
      </div>
    );
  }
  
  if (applications.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No applications found. Submit your first application to get started.</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Merchant</TableHead>
            <TableHead>Lender</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.merchant_name}</TableCell>
              <TableCell>{app.lender_name}</TableCell>
              <TableCell>
                <StatusBadge status={app.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatCreatedAt(app.created_at)}
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
  let label = status;
  
  switch (status.toLowerCase()) {
    case "pending":
      variant = "secondary";
      break;
    case "approved":
      variant = "default";
      break;
    case "funded":
      variant = "success";
      break;
    case "rejected":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{label}</Badge>;
}

function formatCreatedAt(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return dateString;
  }
}
