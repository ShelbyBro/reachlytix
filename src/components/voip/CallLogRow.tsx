
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";

interface CallLogRowProps {
  timestamp: string;
  status: string;
  number: string;
  agentName?: string;
  notes?: string;
}

export function CallLogRow({ timestamp, status, number, agentName, notes }: CallLogRowProps) {
  return (
    <TableRow>
      <TableCell>{format(new Date(timestamp), 'MMM dd, yyyy HH:mm')}</TableCell>
      <TableCell className="font-medium capitalize">{status}</TableCell>
      <TableCell>{number}</TableCell>
      <TableCell>{agentName || 'Unassigned'}</TableCell>
      <TableCell className="max-w-[200px] truncate">{notes || '-'}</TableCell>
    </TableRow>
  );
}
