
import Layout from "@/components/layout";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SimpleCampaign } from "@/types/campaign";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CreateCampaignForm } from "@/components/campaigns/CreateCampaignForm";
import { SendCampaignDialog } from "@/components/campaigns/SendCampaignDialog";
import { useCampaigns } from "@/hooks/use-campaigns";

export default function ManageCampaigns() {
  const { toast } = useToast();
  const { 
    campaigns, 
    campaignsLoading, 
    campaignLeads, 
    campaignScripts, 
    refetchCampaigns 
  } = useCampaigns();
  
  const [selectedCampaign, setSelectedCampaign] = useState<SimpleCampaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<SimpleCampaign | null>(null);

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Campaign deleted",
        description: "The campaign has been deleted successfully."
      });

      refetchCampaigns();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete campaign."
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Campaign Manager</h1>
        
        <div className="grid gap-8 md:grid-cols-[1fr_400px]">
          <CampaignList 
            campaigns={campaigns}
            campaignsLoading={campaignsLoading}
            campaignLeads={campaignLeads}
            onSendCampaign={setSelectedCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            onEditCampaign={setEditingCampaign}
          />
          
          <CreateCampaignForm 
            onCampaignCreated={refetchCampaigns}
            editingCampaign={editingCampaign}
            onCancel={() => setEditingCampaign(null)}
          />
        </div>

        <SendCampaignDialog
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          campaign={selectedCampaign}
          leads={selectedCampaign ? campaignLeads[selectedCampaign.id] || [] : []}
          script={selectedCampaign ? campaignScripts[selectedCampaign.id] : null}
          onSendSuccess={refetchCampaigns}
        />
      </div>
    </Layout>
  );
}
