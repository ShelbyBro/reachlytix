
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/layout";

// NEW IsoLead type to match the schema
type IsoLead = {
  id: string;
  lead_id: string;
  iso_id: string;
  status: string;
  assigned_agent_id: string | null;
  created_at: string;
  notes: string | null;
};

const STATUS_OPTIONS = [
  { value: "unassigned", label: "Unassigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
  { value: "closed", label: "Closed" },
  { value: "follow_up", label: "Follow-Up" },
];

// Dialog for adding a new ISO lead
function AddIsoLeadDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const [leadId, setLeadId] = useState("");
  const [isoId, setIsoId] = useState("");
  const [status, setStatus] = useState("unassigned");
  const [assignedAgentId, setAssignedAgentId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!leadId || !isoId) {
      toast({ description: "Lead ID and ISO ID are required", title: "Missing Info" });
      return;
    }
    setLoading(true);
    // created_at: handled by default
    const { error } = await supabase.from("iso_leads").insert([
      {
        lead_id: leadId,
        iso_id: isoId,
        status,
        assigned_agent_id: assignedAgentId || null,
        notes: notes || null,
      },
    ]);
    setLoading(false);
    if (error) {
      toast({ title: "Failed to add lead", description: error.message });
    } else {
      toast({ title: "Lead added" });
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New ISO Lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Lead ID *" value={leadId} onChange={e => setLeadId(e.target.value)} />
          <Input placeholder="ISO ID *" value={isoId} onChange={e => setIsoId(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue>{STATUS_OPTIONS.find(o => o.value === status)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Assigned Agent ID (optional)" value={assignedAgentId} onChange={e => setAssignedAgentId(e.target.value)} />
          <Input placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function IsoLeadsTable({
  leads,
  onStatusChange,
}: {
  leads: IsoLead[];
  onStatusChange: (id: string, newStatus: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Lead ID</TableHead>
          <TableHead>ISO ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned Agent ID</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead>Date Added</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map(lead => (
          <TableRow key={lead.id}>
            <TableCell>{lead.lead_id}</TableCell>
            <TableCell>{lead.iso_id}</TableCell>
            <TableCell>
              <Select
                value={lead.status}
                onValueChange={status => onStatusChange(lead.id, status)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {STATUS_OPTIONS.find(o => o.value === lead.status)?.label ?? lead.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{lead.assigned_agent_id ?? ""}</TableCell>
            <TableCell>{lead.notes ?? ""}</TableCell>
            <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function IsoLeadsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch ISO leads
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["iso-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("iso_leads")
        .select("id, lead_id, iso_id, status, assigned_agent_id, created_at, notes")
        .order("created_at", { ascending: false });
      if (error || !data) return [];
      return data as IsoLead[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      return supabase.from("iso_leads").update({ status: newStatus }).eq("id", id);
    },
    onSuccess: () => {
      toast({ title: "Lead status updated" });
      refetch();
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err.message });
    }
  });

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span role="img" aria-label="ISO Leads">👥</span> ISO Leads Management
          </h1>
          <Button onClick={() => setDialogOpen(true)} className="btn-futuristic">+ Add New ISO Lead</Button>
        </div>
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : (
          <IsoLeadsTable
            leads={data || []}
            onStatusChange={(id, newStatus) => updateStatusMutation.mutate({ id, newStatus })}
          />
        )}
        <AddIsoLeadDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={() => {
            setDialogOpen(false);
            refetch();
          }}
        />
      </div>
    </Layout>
  );
}
