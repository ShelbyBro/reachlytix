
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/layout";

type IsoLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  assigned_iso_agent: string;
  date_added: string;
};

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function AddIsoLeadDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("new");
  const [agent, setAgent] = useState("");
  const [loading, setLoading] = useState(false);

  // Insert into iso_leads
  const handleSubmit = async () => {
    if (!name) {
      toast({ description: "Name is required", title: "Missing Info" });
      return;
    }
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("iso_leads").insert([
      {
        name,
        email,
        phone,
        status,
        assigned_iso_agent: agent,
        created_by: userData.user.id,
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
          <Input placeholder="Name *" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
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
          <Input placeholder="Assigned ISO Agent" value={agent} onChange={e => setAgent(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function IsoLeadsTable({ leads, onStatusChange }: { leads: IsoLead[]; onStatusChange: (id: string, newStatus: string) => void }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned ISO Agent</TableHead>
          <TableHead>Date Added</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map(lead => (
          <TableRow key={lead.id}>
            <TableCell>{lead.name}</TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell>{lead.phone}</TableCell>
            <TableCell>
              <Select
                value={lead.status}
                onValueChange={status => onStatusChange(lead.id, status)}
              >
                <SelectTrigger>
                  <SelectValue>{STATUS_OPTIONS.find(o => o.value === lead.status)?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{lead.assigned_iso_agent}</TableCell>
            <TableCell>{new Date(lead.date_added).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function IsoLeadsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch ISO leads for the current user
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["iso-leads"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("iso_leads")
        .select("*")
        .eq("created_by", userData.user.id)
        .order("date_added", { ascending: false });
      if (error) throw error;
      return data as IsoLead[];
    }
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
