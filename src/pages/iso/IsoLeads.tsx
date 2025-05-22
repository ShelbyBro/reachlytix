
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import AddIsoLeadDialog from "./components/AddIsoLeadDialog";
import { useAuth } from "@/contexts/AuthContext";
import { IsoLeadsTable, IsoLead } from "./components/IsoLeadsTable";

// We no longer use status options here - that's handled in the row's selector

export default function IsoLeadsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  // Fetch ISO leads for this user's iso_id (from their profile if available)
  // For simplicity, assume the user's id is their iso_id (for demo). Adjust as needed.
  const iso_id = user?.id ?? "";

  const {
    data: leads,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["iso-leads", iso_id],
    queryFn: async () => {
      // Select iso_leads, join leads and assigned_agent
      const { data, error } = await supabase
        .from("iso_leads")
        .select(`
          id,
          iso_id,
          lead_id,
          assigned_agent_id,
          status,
          notes,
          created_at,
          lead:leads (
            name,
            email,
            phone,
            source
          ),
          assigned_agent:profiles (
            first_name,
            last_name
          )
        `)
        .eq("iso_id", iso_id)
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      return data as IsoLead[];
    },
  });

  // Status update handled inside IsoLeadsTable

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span role="img" aria-label="ISO Leads">👥</span> ISO Leads Management
          </h1>
          <Button onClick={() => setDialogOpen(true)}>+ Add New ISO Lead</Button>
        </div>
        <IsoLeadsTable
          leads={leads}
          loading={isLoading}
          error={error}
          onEdit={() => {}}
          onNotes={() => {}}
          onAssign={() => {}}
        />
        <AddIsoLeadDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={() => {
            setDialogOpen(false);
            refetch();
          }}
          isoId={iso_id}
        />
      </div>
    </Layout>
  );
}
