
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
import { Merchant } from "./IsoMerchants";

interface MerchantsTableProps {
  merchants: Merchant[];
  isLoading: boolean;
}

export function MerchantsTable({ merchants, isLoading }: MerchantsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading merchants...</span>
      </div>
    );
  }
  
  if (merchants.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No merchants found. Add your first merchant to get started.</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Business Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {merchants.map((merchant) => (
            <TableRow key={merchant.id}>
              <TableCell className="font-medium">{merchant.name}</TableCell>
              <TableCell>{merchant.business_type}</TableCell>
              <TableCell>{merchant.contact_info}</TableCell>
              <TableCell>
                <StatusBadge status={merchant.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatCreatedAt(merchant.created_at)}
              </TableCell>
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

function formatCreatedAt(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return dateString;
  }
}
