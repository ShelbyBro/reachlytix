
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
import { ArrowUpRight, FilePlus, RefreshCcw, UserPlus } from "lucide-react";

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
};

export default function IsoDashboard() {
  const { profile, role } = useAuth();
  const [greeting, setGreeting] = useState("");
  
  // Fetch ISO leads
  const { data: isoLeads, isLoading, error, refetch } = useQuery({
    queryKey: ['iso-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iso_leads')
        .select(`
          *,
          lead:leads(name, email, phone, source)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as IsoLead[];
    }
  });

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    const greetingText =
      hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    setGreeting(`${greetingText}, ${profile?.first_name || "ISO Partner"}!`);
  }, [profile]);

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
              <IsoLeadsTable leads={isoLeads} loading={isLoading} error={error} />
            </TabsContent>
            <TabsContent value="unassigned" className="border rounded-md mt-2">
              <IsoLeadsTable 
                leads={isoLeads?.filter(lead => lead.status === 'unassigned')} 
                loading={isLoading} 
                error={error} 
              />
            </TabsContent>
            <TabsContent value="in_progress" className="border rounded-md mt-2">
              <IsoLeadsTable 
                leads={isoLeads?.filter(lead => lead.status === 'in_progress')} 
                loading={isLoading} 
                error={error} 
              />
            </TabsContent>
            <TabsContent value="converted" className="border rounded-md mt-2">
              <IsoLeadsTable 
                leads={isoLeads?.filter(lead => lead.status === 'converted')} 
                loading={isLoading} 
                error={error} 
              />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Layout>
  );
}

function IsoLeadsTable({ 
  leads, 
  loading, 
  error 
}: { 
  leads?: IsoLead[], 
  loading: boolean, 
  error: unknown 
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
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
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
              {new Date(lead.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon">
                <ArrowUpRight className="h-4 w-4" />
                <span className="sr-only">View details</span>
              </Button>
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
      case 'lost': return "destructive";
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
