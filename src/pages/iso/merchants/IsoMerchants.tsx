
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { MerchantsTable } from "./MerchantsTable";
import { AddMerchantDialog } from "./AddMerchantDialog";
import { Merchant } from "@/types/iso";

export default function IsoMerchants() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch merchants for the current ISO
  const { data: merchants, isLoading, error, refetch } = useQuery({
    queryKey: ['iso-merchants'],
    queryFn: async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");
        
        // For now, return mock data as the merchants table may not exist yet
        return [
          {
            id: '1',
            name: 'ABC Restaurant',
            business_type: 'Restaurant',
            contact_info: 'contact@abcrestaurant.com',
            status: 'active',
            notes: 'Good customer history',
            iso_id: userData.user.id,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'XYZ Retail',
            business_type: 'Retail',
            contact_info: 'info@xyzretail.com',
            status: 'pending',
            notes: 'New application',
            iso_id: userData.user.id,
            created_at: new Date().toISOString()
          }
        ] as Merchant[];
      } catch (error) {
        console.error("Error fetching merchants:", error);
        throw error;
      }
    }
  });
  
  useEffect(() => {
    if (error) {
      console.error("Error fetching merchants:", error);
      toast.error("Failed to load merchants");
    }
  }, [error]);
  
  const handleSuccess = () => {
    refetch();
    setIsDialogOpen(false);
    toast.success("Merchant added successfully");
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Merchants</h1>
            <p className="text-muted-foreground">
              Manage your business clients
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> Add Merchant
          </Button>
        </div>
        
        <MerchantsTable merchants={merchants || []} isLoading={isLoading} />
        
        <AddMerchantDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={handleSuccess}
        />
      </div>
    </Layout>
  );
}
