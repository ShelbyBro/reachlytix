
// Cleaned up and refactored ISO Leads page for the correct table schema

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import AddIsoLeadDialog from "./components/AddIsoLeadDialog";
import { useAuth } from "@/contexts/AuthContext";

type IsoLead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  assigned_iso_agent: string | null;
  date_added: string | null;
  created_by: string | null;
};

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

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
            <TableCell>{lead.phone ?? ""}</TableCell>
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
            <TableCell>{lead.assigned_iso_agent ?? ""}</TableCell>
            <TableCell>{lead.date_added ? new Date(lead.date_added).toLocaleDateString() : ""}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function IsoLeadsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth(); // get the current user

  // Fetch ISO leads, current user's records only
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["iso-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("iso_leads")
        .select("id, name, email, phone, status, assigned_iso_agent, date_added, created_by")
        .order("date_added", { ascending: false });
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
            leads={data?.filter(l => l.created_by === user?.id) || []}
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
          userId={user?.id || null}
        />
      </div>
    </Layout>
  );
}
