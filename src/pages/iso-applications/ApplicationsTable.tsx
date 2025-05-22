
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Application {
  id: string;
  lead_name: string;
  requested_amount: number;
  status: string;
  submitted_on: string;
  assigned_processor: string | null;
}

type StatusOption = "Pending" | "Approved" | "Rejected";

const statusOptions: StatusOption[] = ["Pending", "Approved", "Rejected"];

export function ApplicationsTable({
  applications,
  loading,
  onStatusChange,
}: {
  applications: Application[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: StatusOption) => void;
}) {
  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="animate-spin mr-3" />
        Loading applications...
      </div>
    );
  }

  if (!applications.length) {
    return (
      <div className="w-full text-center py-12 text-muted-foreground border rounded-lg bg-card/60">
        No applications yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-x-auto border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Application ID</TableHead>
            <TableHead>Lead Name</TableHead>
            <TableHead>Requested Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted On</TableHead>
            <TableHead>Assigned Processor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-mono text-xs">{app.id.slice(0,8)}...</TableCell>
              <TableCell>{app.lead_name}</TableCell>
              <TableCell>${Number(app.requested_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
              <TableCell>
                <select
                  value={app.status}
                  className="bg-muted/80 rounded px-3 py-1 border"
                  onChange={e => onStatusChange(app.id, e.target.value as StatusOption)}
                >
                  {statusOptions.map((opt) => (
                    <option value={opt} key={opt}>{opt}</option>
                  ))}
                </select>
              </TableCell>
              <TableCell>{new Date(app.submitted_on).toLocaleDateString()}</TableCell>
              <TableCell>{app.assigned_processor || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
