
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, FileText, UserPlus } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { StatusSelector } from "./StatusSelector";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
  onAssign: (lead: IsoLead) => void;
}

export function IsoLeadsTable({ leads, loading, error, onEdit, onNotes, onAssign }: IsoLeadsTableProps) {
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  
  const handleStatusChange = async (lead: IsoLead, newStatus: string) => {
    try {
      setUpdatingLeadId(lead.id);
      
      const { error } = await supabase
        .from('iso_leads')
        .update({ status: newStatus })
        .eq('id', lead.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Lead status updated.",
      });
      
      // Trigger a refresh of the leads list in the parent component
      // This is handled by modifying the lead in-place for now
      lead.status = newStatus;
      
    } catch (err) {
      console.error("Error updating lead status:", err);
      toast({
        title: "Error",
        description: "Failed to update lead status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingLeadId(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-center" role="status">Loading leads data...</div>;
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
                {lead.assigned_agent ? 
                  `${lead.assigned_agent.first_name || ""} ${lead.assigned_agent.last_name || ""}`.trim() || "N/A" 
                  : "Unassigned"}
              </TableCell>
              <TableCell>
                <StatusSelector 
                  currentStatus={lead.status}
                  onStatusChange={(newStatus) => handleStatusChange(lead, newStatus)}
                  isDisabled={updatingLeadId === lead.id}
                />
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssign(lead)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Assign
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
