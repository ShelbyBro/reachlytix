
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ApplicationsTable } from "./ApplicationsTable";
import { NewApplicationDialog } from "./NewApplicationDialog";
import { Application } from "@/types/iso";

export default function IsoApplications() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch applications for the current ISO
  const { data: applications, isLoading, error, refetch } = useQuery({
    queryKey: ['iso-applications'],
    queryFn: async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");
        
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            merchant_id,
            lender_id,
            iso_id,
            status,
            created_at,
            merchants:merchant_id (name),
            lenders:lender_id (name)
          `)
          .eq('iso_id', userData.user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Map to include merchant and lender names in the application object
        return data.map(app => ({
          ...app,
          merchant_name: app.merchants?.name,
          lender_name: app.lenders?.name
        })) as Application[];
      } catch (error) {
        console.error("Error fetching applications:", error);
        throw error;
      }
    }
  });
  
  useEffect(() => {
    if (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    }
  }, [error]);
  
  const handleSuccess = () => {
    refetch();
    setIsDialogOpen(false);
    toast.success("Application submitted successfully");
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Loan Applications</h1>
            <p className="text-muted-foreground">
              Manage merchant loan applications
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
            <Plus size={16} /> Apply Now
          </Button>
        </div>
        
        <ApplicationsTable applications={applications || []} isLoading={isLoading} />
        
        <NewApplicationDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={handleSuccess}
        />
      </div>
    </Layout>
  );
}
