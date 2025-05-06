import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FilePlus, RefreshCcw, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";
import { IsoLeadsTable, IsoLead } from "./components/IsoLeadsTable";
import { StatsCard } from "./components/StatsCard";
import { LeadEditDialog } from "./components/LeadEditDialog";
import { NotesDialog } from "./components/NotesDialog";

type Agent = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export default function IsoDashboard() {
  const { profile, role } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [selectedLead, setSelectedLead] = useState<IsoLead | null>(null);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  
  // Fetch available agents
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'agent');
      
      if (error) throw error;
      return data as Agent[];
    }
  });
  
  // Fetch ISO leads with error handling for assigned_agent
  const { data: isoLeads, isLoading, error, refetch } = useQuery({
    queryKey: ['iso-leads'],
    queryFn: async () => {
      // Fix error #1: Get the session user data correctly
      const { data: userResponse, error: userError } = await supabase.auth.getUser();
      if (userError || !userResponse.user) throw new Error("Not authenticated");
      
      const userId = userResponse.user.id;

      // Join iso_leads with leads table and optional join with profiles for agent data
      const { data, error } = await supabase
        .from('iso_leads')
        .select(`
          *,
          lead:leads(name, email, phone, source),
          assigned_agent:profiles!assigned_agent_id(first_name, last_name)
        `)
        .eq('iso_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching ISO leads:", error);
        throw error;
      }
      
      if (!data) return [];
      
      // Transform the data to match our IsoLead type, handling potential errors
      return data.map(lead => {
        // Create a properly shaped IsoLead object with proper null checking
        const transformedLead: IsoLead = {
          id: lead.id,
          iso_id: lead.iso_id,
          lead_id: lead.lead_id,
          assigned_agent_id: lead.assigned_agent_id,
          status: lead.status,
          notes: lead.notes,
          created_at: lead.created_at,
          lead: lead.lead,
          // Fix: Add proper null checking with additional safety for assigned_agent properties
          assigned_agent: lead.assigned_agent && 
                         typeof lead.assigned_agent === 'object' && 
                         !('error' in lead.assigned_agent) ? 
                         {
                           first_name: lead.assigned_agent?.first_name ?? null,
                           last_name: lead.assigned_agent?.last_name ?? null
                         } : null
        };
        
        return transformedLead;
      });
    }
  });

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    const greetingText =
      hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    setGreeting(`${greetingText}, ${profile?.first_name || "ISO Partner"}!`);
  }, [profile]);

  // Forms for managing leads
  const leadForm = useForm({
    defaultValues: {
      status: "",
      assigned_agent_id: "",
    }
  });

  const notesForm = useForm({
    defaultValues: {
      notes: "",
    }
  });

  // Reset form when selected lead changes
  useEffect(() => {
    if (selectedLead) {
      leadForm.reset({
        status: selectedLead.status,
        assigned_agent_id: selectedLead.assigned_agent_id || "",
      });
      notesForm.reset({
        notes: selectedLead.notes || "",
      });
    }
  }, [selectedLead, leadForm, notesForm]);

  // Handle lead update
  const handleLeadUpdate = async (values: { status: string; assigned_agent_id: string }) => {
    if (!selectedLead) return;

    try {
      const { error } = await supabase
        .from('iso_leads')
        .update({
          status: values.status,
          assigned_agent_id: values.assigned_agent_id || null,
        })
        .eq('id', selectedLead.id);

      if (error) throw error;
      
      toast.success("Lead updated successfully");
      refetch();
      setIsLeadDialogOpen(false);
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    }
  };

  // Handle notes update
  const handleNotesUpdate = async (values: { notes: string }) => {
    if (!selectedLead) return;

    try {
      const { error } = await supabase
        .from('iso_leads')
        .update({
          notes: values.notes,
        })
        .eq('id', selectedLead.id);

      if (error) throw error;
      
      toast.success("Notes updated successfully");
      refetch();
      setIsNotesDialogOpen(false);
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("Failed to update notes");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-4">
        {/* Dashboard Header */}
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-muted-foreground">
            Welcome to your ISO Dashboard. Manage your leads and assignments here.
          </p>
        </section>

        {/* Stats Cards */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Leads"
            value={isLoading ? "-" : isoLeads?.length || 0}
            description="Active leads in your account"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatsCard
            title="Unassigned"
            value={isLoading ? "-" : isoLeads?.filter(lead => lead.status === 'unassigned').length || 0}
            description="Leads waiting for assignment"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            }
          />
          <StatsCard
            title="In Progress"
            value={isLoading ? "-" : isoLeads?.filter(lead => lead.status === 'in_progress').length || 0}
            description="Leads currently in progress"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            }
          />
          <StatsCard
            title="Converted"
            value={isLoading ? "-" : isoLeads?.filter(lead => lead.status === 'converted').length || 0}
            description="Successfully converted leads"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
        </section>

        {/* Leads Management */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Your Leads</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} className="flex items-center">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button size="sm" className="flex items-center">
                <FilePlus className="mr-2 h-4 w-4" />
                Import Leads
              </Button>
              <Button size="sm" className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Leads</TabsTrigger>
              <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="converted">Converted</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="border rounded-md mt-2">
              <IsoLeadsTable 
                leads={isoLeads} 
                loading={isLoading} 
                error={error} 
                onEdit={(lead) => {
                  setSelectedLead(lead);
                  setIsLeadDialogOpen(true);
                }}
                onNotes={(lead) => {
                  setSelectedLead(lead);
                  setIsNotesDialogOpen(true);
                }}
              />
            </TabsContent>
            <TabsContent value="unassigned" className="border rounded-md mt-2">
              <IsoLeadsTable 
                leads={isoLeads?.filter(lead => lead.status === 'unassigned')} 
                loading={isLoading} 
                error={error} 
                onEdit={(lead) => {
                  setSelectedLead(lead);
                  setIsLeadDialogOpen(true);
                }}
                onNotes={(lead) => {
                  setSelectedLead(lead);
                  setIsNotesDialogOpen(true);
                }}
              />
            </TabsContent>
            <TabsContent value="in_progress" className="border rounded-md mt-2">
              <IsoLeadsTable 
                leads={isoLeads?.filter(lead => lead.status === 'in_progress')} 
                loading={isLoading} 
                error={error} 
                onEdit={(lead) => {
                  setSelectedLead(lead);
                  setIsLeadDialogOpen(true);
                }}
                onNotes={(lead) => {
                  setSelectedLead(lead);
                  setIsNotesDialogOpen(true);
                }}
              />
            </TabsContent>
            <TabsContent value="converted" className="border rounded-md mt-2">
              <IsoLeadsTable 
                leads={isoLeads?.filter(lead => lead.status === 'converted')} 
                loading={isLoading} 
                error={error} 
                onEdit={(lead) => {
                  setSelectedLead(lead);
                  setIsLeadDialogOpen(true);
                }}
                onNotes={(lead) => {
                  setSelectedLead(lead);
                  setIsNotesDialogOpen(true);
                }}
              />
            </TabsContent>
          </Tabs>
        </section>
      </div>

      {/* Dialogs */}
      <LeadEditDialog
        open={isLeadDialogOpen}
        onOpenChange={setIsLeadDialogOpen}
        selectedLead={selectedLead}
        agents={agents}
        form={leadForm}
        onSubmit={handleLeadUpdate}
      />

      <NotesDialog
        open={isNotesDialogOpen}
        onOpenChange={setIsNotesDialogOpen}
        selectedLead={selectedLead}
        form={notesForm}
        onSubmit={handleNotesUpdate}
      />
    </Layout>
  );
}
