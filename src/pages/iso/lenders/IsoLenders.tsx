
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { toast } from "sonner";
import { LendersTable } from "./LendersTable";
import { Lender } from "@/types/iso";

export default function IsoLenders() {
  // Fetch lenders (read-only for ISOs)
  const { data: lenders, isLoading, error } = useQuery({
    queryKey: ['iso-lenders'],
    queryFn: async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");
        
        // For now, return mock data as the lenders table may not exist yet
        return [
          {
            id: '1',
            name: 'First Capital Bank',
            interest_rate: 5.25,
            type: 'Term Loan',
            status: 'active',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Business Credit Union',
            interest_rate: 4.75,
            type: 'Line of Credit',
            status: 'active',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Merchant Advance',
            interest_rate: 8.5,
            type: 'Merchant Cash Advance',
            status: 'active',
            created_at: new Date().toISOString()
          }
        ] as Lender[];
      } catch (error) {
        console.error("Error fetching lenders:", error);
        throw error;
      }
    }
  });
  
  useEffect(() => {
    if (error) {
      console.error("Error fetching lenders:", error);
      toast.error("Failed to load lenders");
    }
  }, [error]);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Lenders</h1>
          <p className="text-muted-foreground">
            Available lending partners for your merchants
          </p>
        </div>
        
        <div className="bg-muted/20 p-4 rounded-md mb-6">
          <p className="text-sm">
            <span className="font-medium">Note:</span> Lender information is maintained by the platform administrators. 
            Contact support if you'd like to suggest a new lending partner.
          </p>
        </div>
        
        <LendersTable lenders={lenders || []} isLoading={isLoading} />
      </div>
    </Layout>
  );
}
