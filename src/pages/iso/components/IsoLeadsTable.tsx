
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Edit } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

// Type definition for ISO Lead
export type IsoLead = {
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
    phone: string;
    source: string;
  };
  // Make assigned_agent optional and adjust its type
  assigned_agent?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

interface IsoLeadsTableProps { 
  leads?: IsoLead[];
  loading: boolean;
  error: unknown;
  onEdit: (lead: IsoLead) => void;
  onNotes: (lead: IsoLead) => void;
}

export function IsoLeadsTable({ 
  leads, 
  loading, 
  error,
  onEdit,
  onNotes
}: IsoLeadsTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading leads. Please try again.
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No leads found in this category.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads?.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">{lead.lead?.name || 'N/A'}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{lead.lead?.email || 'N/A'}</span>
                <span className="text-muted-foreground text-sm">{lead.lead?.phone || 'N/A'}</span>
              </div>
            </TableCell>
            <TableCell>{lead.lead?.source || 'N/A'}</TableCell>
            <TableCell>
              <StatusBadge status={lead.status} />
            </TableCell>
            <TableCell>
              {lead.assigned_agent ? 
                `${lead.assigned_agent?.first_name || ''} ${lead.assigned_agent?.last_name || ''}`.trim() || 'N/A' : 
                'Unassigned'}
            </TableCell>
            <TableCell>
              {lead.notes ? 
                <span className="line-clamp-1 max-w-[120px]">{lead.notes}</span> : 
                <span className="text-muted-foreground text-sm">No notes</span>}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(lead)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit lead</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onNotes(lead)}>
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="sr-only">View notes</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
