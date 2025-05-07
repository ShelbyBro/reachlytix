
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, FileText } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

// Define the type for the lead
export interface IsoLead {
  id: string;
  iso_id: string;
  lead_id: string;
  assigned_agent_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  lead: {
    name: string;
    email: string;
    phone: string | null;
    source: string | null;
  };
  assigned_agent: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface IsoLeadsTableProps {
  leads?: IsoLead[];
  loading: boolean;
  error: any;
  onEdit: (lead: IsoLead) => void;
  onNotes: (lead: IsoLead) => void;
}

export function IsoLeadsTable({ leads, loading, error, onEdit, onNotes }: IsoLeadsTableProps) {
  if (loading) {
    return <div className="p-4 text-center">Loading leads data...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Error loading leads: {error.message || "Unknown error"}
      </div>
    );
  }
  
  if (!leads || leads.length === 0) {
    return <div className="p-4 text-center">No leads found.</div>;
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Assigned Agent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.lead.name || "N/A"}</TableCell>
              <TableCell>{lead.lead.phone || "N/A"}</TableCell>
              <TableCell>{lead.lead.email || "N/A"}</TableCell>
              <TableCell>
                {/* Here we use the proper optional chaining for assigned_agent */}
                {lead.assigned_agent?.first_name || "Unassigned"} {lead.assigned_agent?.last_name || ""}
              </TableCell>
              <TableCell>
                <StatusBadge status={lead.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(lead)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNotes(lead)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Notes
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
