
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Campaign, Lead, Script } from "@/types/campaign";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { SendCampaignDialog } from "@/components/campaigns/SendCampaignDialog";

export default function ManageCampaignsPage() {
  const { toast } = useToast();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

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
      
      return data as Script;
    },
    enabled: !!selectedCampaign?.id,
  });

  const handleSendSuccess = () => {
    refetchCampaigns();
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
              <Dialog>
                <DialogTrigger asChild>
                  <div className="w-full">
                    <CampaignTable 
                      campaigns={campaigns} 
                      isLoading={campaignsLoading} 
                      onSelectCampaign={setSelectedCampaign} 
                    />
                  </div>
                </DialogTrigger>
                {selectedCampaign && (
                  <SendCampaignDialog
                    campaign={selectedCampaign}
                    leads={leads || []}
                    leadsLoading={leadsLoading}
                    campaignScript={campaignScript || null}
                    onSendSuccess={handleSendSuccess}
                  />
                )}
              </Dialog>
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
