import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationsTable } from "./ApplicationsTable";
import { NewIsoAppDialog } from "./NewIsoAppDialog";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type Application = {
  id: string;
  lead_name: string;
  requested_amount: number;
  status: string;
  submitted_on: string;
  assigned_processor: string | null;
};

export default function IsoApplicationsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const [newAppLoading, setNewAppLoading] = useState(false);

  // Fetch only applications created by the logged-in user (RLS enforced)
  const {
    data: applications,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["iso-applications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("iso_applications")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Application[];
    },
    // The meta is not strictly needed for RLS here, as backend enforces it
    // meta: { onError: ... }
  });

  // Status update
  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("iso_applications")
        .update({ status })
        .eq("id", id)
        .eq("created_by", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Status updated!" });
    },
    onError: () => {
      toast({ title: "Status update failed" });
    },
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    mutation.mutate({ id, status: newStatus });
  };

  async function handleNewAppSubmit(data: { lead_name: string; requested_amount: number; assigned_processor?: string }) {
    setNewAppLoading(true);
    try {
      // Always set created_by to current user's ID — can't be spoofed
      const { error } = await supabase.from("iso_applications").insert([
        {
          ...data,
          assigned_processor: data.assigned_processor || null,
          created_by: user?.id,
        },
      ]);
      if (error) throw error;
      setDialogOpen(false);
      toast({ title: "Application created!" });
      refetch();
    } catch (e: any) {
      toast({ title: "Failed to create application", description: e?.message });
    }
    setNewAppLoading(false);
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <span role="img" aria-label="ISO Loan Applications">📄</span>
            ISO Loan Applications
          </h1>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-primary ring-2 ring-primary rounded-lg"
          >
            <Plus size={18} className="mr-2" />
            New Application
          </Button>
        </div>
        {/* Only show a message if no applications */}
        {(!isLoading && (!applications || applications.length === 0)) ? (
          <div className="w-full text-center py-12 text-muted-foreground border rounded-lg bg-card/60">
            No applications yet. Click <span className="font-semibold text-primary">+New Application</span> to add one.
          </div>
        ) : (
          <ApplicationsTable
            applications={applications ?? []}
            loading={isLoading}
            onStatusChange={handleStatusChange}
          />
        )}
        <NewIsoAppDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleNewAppSubmit}
          loading={newAppLoading}
        />
      </div>
    </Layout>
  );
}
