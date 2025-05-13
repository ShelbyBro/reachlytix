
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
        
        // For now, return mock data as the applications table may not exist yet
        return [
          {
            id: '1',
            merchant_id: '1',
            merchant_name: 'ABC Restaurant',
            lender_id: '1',
            lender_name: 'First Capital Bank',
            iso_id: userData.user.id,
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            merchant_id: '2',
            merchant_name: 'XYZ Retail',
            lender_id: '2',
            lender_name: 'Business Credit Union',
            iso_id: userData.user.id,
            status: 'approved',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ] as Application[];
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
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> New Application
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
