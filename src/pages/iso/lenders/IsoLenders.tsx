
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { LendersTable } from "./LendersTable";
import { toast } from "@/components/ui/sonner";
import { useUserRole } from "@/hooks/use-user-role";

export type Lender = {
  id: string;
  name: string;
  interest_rate: number;
  type: string;
  status: string;
  created_at: string;
}

export default function IsoLenders() {
  const { isAdmin } = useUserRole();
  
  // Fetch all lenders
  const { data: lenders, isLoading, error } = useQuery({
    queryKey: ['lenders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lenders')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as Lender[];
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
          <h1 className="text-2xl font-bold">Lender Network</h1>
          <p className="text-muted-foreground">
            All available lending partners in our network
          </p>
        </div>
        
        <LendersTable 
          lenders={lenders || []} 
          isLoading={isLoading} 
          isAdmin={isAdmin()} 
        />
      </div>
    </Layout>
  );
}
