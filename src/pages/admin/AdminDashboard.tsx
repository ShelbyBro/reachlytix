
import { useEffect } from "react";
import Layout from "@/components/layout";
import { AdminFilters } from "./components/AdminFilters";
import { AgentCard } from "./components/AgentCard";
import { useAgentManagement } from "./hooks/use-agent-management";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { role } = useAuth();
  const {
    agents,
    isLoading,
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
    if (role !== "admin") {
      toast.error("You don't have permission to access the admin dashboard");
    }
  }, [role]);

  // Redirect non-admin users
  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
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
          clients={clients}
        />

        <div className="grid gap-6">
          {isLoading ? (
            <div className="text-center">Loading...</div>
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
            <div className="text-center text-muted-foreground">
              No agents found matching the current filters.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
