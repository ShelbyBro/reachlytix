
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddMerchantDialog } from "./AddMerchantDialog";
import { MerchantsTable } from "./MerchantsTable";
import { toast } from "@/components/ui/sonner";

export type Merchant = {
  id: string;
  name: string;
  business_type: string;
  contact_info: string;
  status: string;
  created_at: string;
  notes?: string;
  iso_id: string;
}

export default function IsoMerchants() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch merchants for the current ISO
  const { data: merchants, isLoading, error, refetch } = useQuery({
    queryKey: ['iso-merchants'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('iso_id', userData.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Merchant[];
    }
  });
  
  useEffect(() => {
    if (error) {
      console.error("Error fetching merchants:", error);
      toast.error("Failed to load merchants");
    }
  }, [error]);
  
  const handleAddSuccess = () => {
    refetch();
    setIsAddDialogOpen(false);
    toast.success("Merchant added successfully");
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Merchant Management</h1>
            <p className="text-muted-foreground">
              Manage your merchant accounts
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> Add Merchant
          </Button>
        </div>
        
        <MerchantsTable merchants={merchants || []} isLoading={isLoading} />
        
        <AddMerchantDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
          onSuccess={handleAddSuccess}
        />
      </div>
    </Layout>
  );
}
