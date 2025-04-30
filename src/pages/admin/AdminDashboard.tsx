
import { useEffect } from "react";
import Layout from "@/components/layout";
import { AdminFilters } from "./components/AdminFilters";
import { AgentCard } from "./components/AgentCard";
import { useAgentManagement } from "./hooks/use-agent-management";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { LoadingState } from "@/components/dashboard/LoadingState";

export default function AdminDashboard() {
  const { role, loading: authLoading } = useAuth();
  const {
    agents,
    isLoading,
    error,
    clients,
    statusFilter,
    setStatusFilter,
    clientFilter,
    setClientFilter,
    updatingStatus,
    handleToggleStatus,
    handleDeleteAgent,
    handleResetAgent,
    getStatusBadgeVariant,
    countLeads,
  } = useAgentManagement();

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!authLoading && role !== "admin") {
      toast.error("You don't have permission to access the admin dashboard");
    }
    
    // Debug log - verify role is coming through correctly
    console.log("AdminDashboard - Current user role:", role);
  }, [role, authLoading]);

  // Add debug logging for data fetching
  useEffect(() => {
    console.log("AdminDashboard - Agents data:", agents);
    console.log("AdminDashboard - Clients data:", clients);
    console.log("AdminDashboard - Loading state:", isLoading);
    console.log("AdminDashboard - Error state:", error);
  }, [agents, clients, isLoading, error]);

  // Show loading state while auth is being determined
  if (authLoading) {
    return (
      <Layout isAdmin>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Verifying admin access...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect non-admin users once role is determined
  if (!authLoading && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Handle error state
  if (error) {
    return (
      <Layout isAdmin>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            <h2 className="font-semibold">Error loading dashboard data</h2>
            <p>{error.message || "Something went wrong. Please try again later."}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <AdminFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          clients={clients || []} // Ensure clients is never undefined
        />

        <div className="grid gap-6">
          {isLoading ? (
            <div className="text-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading agent data...</p>
            </div>
          ) : agents && agents.length > 0 ? (
            agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onToggleStatus={handleToggleStatus}
                onReset={handleResetAgent}
                onDelete={handleDeleteAgent}
                updatingStatus={updatingStatus}
                getStatusBadgeVariant={getStatusBadgeVariant}
                countLeads={countLeads}
              />
            ))
          ) : (
            <div className="text-center p-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">
                {statusFilter || clientFilter ? 
                  "No agents found matching the current filters." : 
                  "No AI agents have been created yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
