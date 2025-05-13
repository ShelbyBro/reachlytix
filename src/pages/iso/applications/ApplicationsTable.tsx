
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
import { Application } from "@/types/iso";

interface ApplicationsTableProps {
  applications: Application[];
  isLoading: boolean;
}

export function ApplicationsTable({ applications, isLoading }: ApplicationsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2">Loading applications...</span>
      </div>
    );
  }
  
  if (applications.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No applications found. Click "Apply Now" to submit a new application.</p>
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
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell className="font-medium">{application.merchant_name}</TableCell>
              <TableCell>{application.lender_name}</TableCell>
              <TableCell>
                <StatusBadge status={application.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatCreatedAt(application.created_at)}
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
    case "approved":
      variant = "success";
      break;
    case "pending":
      variant = "secondary";
      break;
    case "rejected":
      variant = "destructive";
      break;
    case "under_review":
      variant = "default";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{status}</Badge>;
}

function formatCreatedAt(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return dateString;
  }
}
