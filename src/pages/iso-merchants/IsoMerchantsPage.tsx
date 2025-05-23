import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MerchantTable from "./MerchantTable";
import NewMerchantDialog, { MerchantFormFields } from "./NewMerchantDialog";

export default function IsoMerchantsPage() {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);

  // Fetch merchants belonging to the logged in ISO user
  const {
    data: merchants,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["iso-merchants", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("iso_merchants")
        .select("*")
        .eq("iso_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("iso_merchants")
        .update({ status })
        .eq("id", id)
        .eq("iso_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => refetch(),
  });

  const handleStatusChange = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

  // Add merchant
  const handleMerchantCreated = async (merchant: MerchantFormFields) => {
    if (!user?.id) return;
    const insertData = {
      ...merchant,
      iso_id: user.id,
    };
    const { error } = await supabase
      .from("iso_merchants")
      .insert([insertData]);
    if (!error) {
      setShowDialog(false);
      refetch();
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-primary-foreground">
          <span role="img" aria-label="Merchant Directory">🏬</span>
          ISO Merchant Directory
        </h1>
        <Button onClick={() => setShowDialog(true)} className="bg-primary ring-2 ring-primary rounded-lg">
          <Plus size={18} className="mr-2" />
          New Merchant
        </Button>
      </div>
      <div className="bg-card shadow rounded-lg p-6">
        <MerchantTable 
          merchants={merchants ?? []}
          loading={isLoading}
          onStatusChange={handleStatusChange}
        />
        {(!isLoading && merchants?.length === 0) && (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card/60 mt-4">
            No merchants yet. Click <span className="font-semibold text-primary">+New Merchant</span> to add one.
          </div>
        )}
      </div>
      <NewMerchantDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSubmit={handleMerchantCreated}
      />
    </div>
  );
}
