import Layout from "@/components/layout";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SimpleCampaign, SimpleLead, SimpleScript } from "@/types/campaign";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CreateCampaignForm } from "@/components/campaigns/CreateCampaignForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, MessageSquare } from "lucide-react";
import { sendCampaignEmails, sendCampaignSMS } from "@/utils/campaign-utils";

export default function ManageCampaigns() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<SimpleCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignLeads, setCampaignLeads] = useState<Record<string, SimpleLead[]>>({});
  const [campaignScripts, setCampaignScripts] = useState<Record<string, SimpleScript>>({});
  const [selectedCampaign, setSelectedCampaign] = useState<SimpleCampaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<SimpleCampaign | null>(null);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [messageType, setMessageType] = useState<"email" | "sms">("email");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const { data: campaignsData, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const campaigns = campaignsData as SimpleCampaign[];
      setCampaigns(campaigns);
      
      await Promise.all([
        fetchCampaignLeads(campaigns),
        fetchCampaignScripts(campaigns)
      ]);
      
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load campaigns."
      });
    } finally {
      setCampaignsLoading(false);
    }
  };

  const fetchCampaignLeads = async (campaigns: SimpleCampaign[]) => {
    try {
      const leadsByIds: Record<string, SimpleLead[]> = {};
      
      await Promise.all(
        campaigns.map(async (campaign) => {
          const { data, error } = await supabase
            .from("leads")
            .select("*")
            .eq("client_id", campaign.client_id);
            
          if (error) throw error;
          leadsByIds[campaign.id] = data as SimpleLead[];
        })
      );
      
      setCampaignLeads(leadsByIds);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const fetchCampaignScripts = async (campaigns: SimpleCampaign[]) => {
    try {
      const scriptsByIds: Record<string, SimpleScript> = {};
      
      await Promise.all(
        campaigns.filter(c => c.script_id).map(async (campaign) => {
          const { data, error } = await supabase
            .from("scripts")
            .select("*")
            .eq("id", campaign.script_id)
            .single();
            
          if (error) {
            console.error(`Error fetching script for campaign ${campaign.id}:`, error);
            return;
          }
          
          scriptsByIds[campaign.id] = data as SimpleScript;
        })
      );
      
      setCampaignScripts(scriptsByIds);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

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

      // Refresh campaigns list
      fetchCampaigns();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete campaign."
      });
    }
  };

  const handleEditCampaign = (campaign: SimpleCampaign) => {
    setEditingCampaign(campaign);
  };

  const handleSendCampaign = async () => {
    if (!selectedCampaign) return;
    
    const campaignId = selectedCampaign.id;
    const leads = campaignLeads[campaignId] || [];
    const script = campaignScripts[campaignId];
    
    if (!leads.length) {
      toast({
        variant: "destructive",
        title: "No leads",
        description: "This campaign doesn't have any leads to send to."
      });
      return;
    }
    
    if (!script && messageType === "email") {
      toast({
        variant: "destructive",
        title: "No content",
        description: "This campaign doesn't have any email content."
      });
      return;
    }
    
    setSendingCampaign(true);
    
    try {
      let result;
      
      if (messageType === "email") {
        result = await sendCampaignEmails(
          campaignId, 
          selectedCampaign.title, 
          script?.title || "No Subject",
          script?.content || "",
          leads
        );
      } else {
        result = await sendCampaignSMS(
          campaignId,
          selectedCampaign.title,
          script?.content || "Default SMS message",
          leads
        );
      }
      
      toast({
        variant: result.success ? "default" : "destructive",
        title: result.success ? "Success" : "Error",
        description: result.message
      });
      
      if (result.success) {
        fetchCampaigns();
      }
    } catch (error: any) {
      console.error("Error sending campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send campaign."
      });
    } finally {
      setSendingCampaign(false);
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
            onEditCampaign={handleEditCampaign}
          />
          
          <CreateCampaignForm 
            onCampaignCreated={fetchCampaigns}
            editingCampaign={editingCampaign}
            onCancel={() => setEditingCampaign(null)}
          />
        </div>

        {/* Send Campaign Dialog */}
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Campaign</DialogTitle>
              <DialogDescription>
                {selectedCampaign && (
                  `You're about to send "${selectedCampaign.title}" to ${campaignLeads[selectedCampaign.id]?.length || 0} leads.`
                )}
                  <div className="mt-4">
                    <RadioGroup 
                      defaultValue={messageType} 
                      onValueChange={(val) => setMessageType(val as "email" | "sms")}
                      className="flex flex-col space-y-3 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email" className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" /> Email
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sms" id="sms" />
                        <Label htmlFor="sms" className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2" /> SMS
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
              </DialogDescription>
            </DialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedCampaign(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={sendingCampaign}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSendCampaign();
                  }}
                >
                  {sendingCampaign ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>Send Now</>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
