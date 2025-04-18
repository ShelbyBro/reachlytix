
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Mail, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type Campaign = {
  id: string;
  title: string;
  status: string;
  type: string;
  created_at: string;
};

type Lead = {
  id: string;
  name: string;
  email: string;
};

export default function ManageCampaignsPage() {
  const { toast } = useToast();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Fetch campaigns
  const { data: campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns } = useQuery({
    queryKey: ['manage-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Campaign[];
    }
  });

  // Fetch leads for a specific campaign when selected
  const { data: leads, isLoading: leadsLoading, refetch: refetchLeads } = useQuery({
    queryKey: ['campaign-leads', selectedCampaign?.id],
    queryFn: async () => {
      if (!selectedCampaign?.id) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, email')
        .eq('campaign_id', selectedCampaign.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!selectedCampaign?.id,
  });

  // Fetch campaign script/content
  const { data: campaignScript } = useQuery({
    queryKey: ['campaign-script', selectedCampaign?.id],
    queryFn: async () => {
      if (!selectedCampaign?.id) return null;
      
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('campaign_id', selectedCampaign.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!selectedCampaign?.id,
  });

  const sendCampaign = async () => {
    if (!selectedCampaign || !leads?.length || !campaignScript) {
      toast({
        variant: "destructive",
        title: "Cannot send campaign",
        description: "Missing campaign, leads, or content.",
      });
      return;
    }

    setSendingEmail(true);
    try {
      // In a real implementation, this would call your edge function to send emails
      // For now, we'll simulate a successful send
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update campaign status to "sent"
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'sent' })
        .eq('id', selectedCampaign.id);

      if (error) throw error;

      toast({
        title: "Campaign sent",
        description: `Email sent to ${leads.length} leads.`,
      });

      // Refetch campaigns to update the status
      refetchCampaigns();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending campaign",
        description: error.message || "Failed to send the campaign.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Campaigns</h1>
            <p className="text-muted-foreground">
              View and send your email campaigns
            </p>
          </div>
          <Button asChild>
            <a href="/campaigns/create">Create New Campaign</a>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Campaigns</CardTitle>
            <CardDescription>
              Select a campaign to send or view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.title}</TableCell>
                      <TableCell className="capitalize">{campaign.type}</TableCell>
                      <TableCell>
                        <span 
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize
                            ${campaign.status === 'sent' ? 'bg-green-100 text-green-800' : 
                              campaign.status === 'draft' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'}`}
                        >
                          {campaign.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(campaign.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedCampaign(campaign)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[625px]">
                            <DialogHeader>
                              <DialogTitle>Send Campaign: {selectedCampaign?.title}</DialogTitle>
                              <DialogDescription>
                                Review details and select leads to send this campaign to
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-6 py-4">
                              <div>
                                <h4 className="font-medium mb-2">Campaign Details</h4>
                                <div className="bg-muted p-3 rounded-md">
                                  <p><strong>Subject:</strong> {campaignScript?.title || "No subject"}</p>
                                  <p className="mt-2"><strong>Content:</strong></p>
                                  <div className="mt-1 whitespace-pre-wrap">
                                    {campaignScript?.content || "No content"}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Recipients</h4>
                                {leadsLoading ? (
                                  <div className="flex justify-center items-center py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  </div>
                                ) : leads && leads.length > 0 ? (
                                  <div className="border rounded-md max-h-[200px] overflow-y-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Name</TableHead>
                                          <TableHead>Email</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {leads.map((lead) => (
                                          <TableRow key={lead.id}>
                                            <TableCell>{lead.name}</TableCell>
                                            <TableCell>{lead.email}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                ) : (
                                  <div className="text-center py-4 bg-muted rounded-md">
                                    <p className="text-sm text-muted-foreground">No leads found for this campaign</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button 
                                onClick={sendCampaign} 
                                disabled={sendingEmail || !leads?.length}
                              >
                                {sendingEmail ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>Send to {leads?.length || 0} Leads</>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No campaigns found</p>
                <Button className="mt-4" asChild>
                  <a href="/campaigns/create">Create Your First Campaign</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
