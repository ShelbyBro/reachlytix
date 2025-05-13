
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { AdminApplicationsTable } from "./AdminApplicationsTable";
import { toast } from "sonner";

export default function AdminApplications() {
  // Fetch all applications
  const { data: applications, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      try {
        // Get all applications with related data
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            merchant_id,
            lender_id,
            iso_id,
            status,
            notes,
            created_at,
            merchants:merchant_id (name),
            lenders:lender_id (name),
            profiles:iso_id (first_name, last_name)
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Map to include merchant, lender and ISO names
        return data.map(app => ({
          ...app,
          merchant_name: app.merchants?.name,
          lender_name: app.lenders?.name,
          iso_name: app.profiles ? `${app.profiles.first_name || ''} ${app.profiles.last_name || ''}`.trim() : 'Unknown'
        }));
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

  const handleStatusUpdate = async () => {
    await refetch();
    toast.success("Application status updated successfully");
  };

  return (
    <Layout isAdmin>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Application Approval Panel</h1>
          <p className="text-muted-foreground">
            Review and manage loan applications
          </p>
        </div>
        
        <AdminApplicationsTable 
          applications={applications || []} 
          isLoading={isLoading}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </Layout>
  );
}
