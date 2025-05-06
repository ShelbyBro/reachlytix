
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, FilePlus, RefreshCcw, UserPlus, Edit, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";

// Updated type definition to handle error cases from Supabase
type IsoLead = {
  id: string;
  iso_id: string;
  lead_id: string;
  assigned_agent_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  lead: {
    name: string;
    email: string;
    phone: string;
    source: string;
  };
  // Make assigned_agent optional and adjust its type
  assigned_agent?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "-" : isoLeads?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active leads in your account
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "-" : isoLeads?.filter(lead => lead.status === 'unassigned').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Leads waiting for assignment
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "-" : isoLeads?.filter(lead => lead.status === 'in_progress').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Leads currently in progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Converted</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "-" : isoLeads?.filter(lead => lead.status === 'converted').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully converted leads
              </p>
            </CardContent>
          </Card>
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

      {/* Lead Edit Dialog */}
      <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update the lead status or assign an agent.
            </DialogDescription>
          </DialogHeader>
          <Form {...leadForm}>
            <form onSubmit={leadForm.handleSubmit(handleLeadUpdate)} className="space-y-4 py-2">
              <FormField
                control={leadForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={leadForm.control}
                name="assigned_agent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Agent</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {agents?.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.first_name} {agent.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Lead Notes</DialogTitle>
            <DialogDescription>
              Add or update notes for this lead.
            </DialogDescription>
          </DialogHeader>
          <Form {...notesForm}>
            <form onSubmit={notesForm.handleSubmit(handleNotesUpdate)} className="space-y-4 py-2">
              <FormField
                control={notesForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter notes about this lead" 
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Save Notes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function IsoLeadsTable({ 
  leads, 
  loading, 
  error,
  onEdit,
  onNotes
}: { 
  leads?: IsoLead[], 
  loading: boolean, 
  error: unknown,
  onEdit: (lead: IsoLead) => void,
  onNotes: (lead: IsoLead) => void
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading leads. Please try again.
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No leads found in this category.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads?.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">{lead.lead?.name || 'N/A'}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{lead.lead?.email || 'N/A'}</span>
                <span className="text-muted-foreground text-sm">{lead.lead?.phone || 'N/A'}</span>
              </div>
            </TableCell>
            <TableCell>{lead.lead?.source || 'N/A'}</TableCell>
            <TableCell>
              <StatusBadge status={lead.status} />
            </TableCell>
            <TableCell>
              {lead.assigned_agent ? 
                `${lead.assigned_agent?.first_name || ''} ${lead.assigned_agent?.last_name || ''}`.trim() || 'N/A' : 
                'Unassigned'}
            </TableCell>
            <TableCell>
              {lead.notes ? 
                <span className="line-clamp-1 max-w-[120px]">{lead.notes}</span> : 
                <span className="text-muted-foreground text-sm">No notes</span>}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(lead)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit lead</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onNotes(lead)}>
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="sr-only">View notes</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getVariant = (status: string) => {
    switch(status) {
      case 'unassigned': return "outline";
      case 'in_progress': return "secondary";
      case 'converted': return "default";
      case 'rejected': return "destructive";
      case 'closed': return "outline";
      default: return "outline";
    }
  };

  const getLabel = (status: string) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
  };

  return (
    <Badge variant={getVariant(status) as any}>
      {getLabel(status)}
    </Badge>
  );
}
