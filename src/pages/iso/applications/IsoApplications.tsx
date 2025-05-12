
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { ApplicationsTable } from "./ApplicationsTable";
import { NewApplicationDialog } from "./NewApplicationDialog";

export type Application = {
  id: string;
  merchant_id: string;
  lender_id: string;
  iso_id: string;
  status: string;
  created_at: string;
  merchant_name?: string;
  lender_name?: string;
}

export default function IsoApplications() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch applications for the current ISO
  const { data: applications, isLoading, error, refetch } = useQuery({
    queryKey: ['iso-applications'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");
      
      // Placeholder for actual applications query
      // This will be replaced once the applications table is created in Supabase
      return [] as Application[];
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
