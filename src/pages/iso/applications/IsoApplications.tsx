
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ApplicationsTable } from "./ApplicationsTable";
import { NewApplicationDialog } from "./NewApplicationDialog";
import { toast } from "@/components/ui/sonner";

export type Application = {
  id: string;
  merchant_id: string;
  merchant_name: string;
  lender_id: string;
  lender_name: string;
  status: string;
  created_at: string;
  iso_id: string;
}

export default function IsoApplications() {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  
  // Fetch applications for the current ISO
  const { data: applications, isLoading, error, refetch } = useQuery({
    queryKey: ['iso-applications'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      
      // Query applications with merchant and lender names
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          merchants(name),
          lenders(name)
        `)
        .eq('iso_id', userData.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to include merchant and lender names
      return data.map(app => ({
        ...app,
        merchant_name: app.merchants?.name || 'Unknown',
        lender_name: app.lenders?.name || 'Unknown'
      })) as Application[];
    }
  });
  
  useEffect(() => {
    if (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    }
  }, [error]);
  
  const handleAddSuccess = () => {
    refetch();
    setIsNewDialogOpen(false);
    toast.success("Application submitted successfully");
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Merchant Applications</h1>
            <p className="text-muted-foreground">
              Apply for funding for your merchants
            </p>
          </div>
          <Button onClick={() => setIsNewDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> Apply Now
          </Button>
        </div>
        
        <ApplicationsTable applications={applications || []} isLoading={isLoading} />
        
        <NewApplicationDialog 
          open={isNewDialogOpen} 
          onOpenChange={setIsNewDialogOpen} 
          onSuccess={handleAddSuccess}
        />
      </div>
    </Layout>
  );
}
