
import Layout from "@/components/layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, MessageSquare } from "lucide-react";
import { formatDate, sendCampaignEmails, sendCampaignSMS } from "@/utils/campaign-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Simplified type definitions to avoid deep type instantiation
type SimpleCampaign = {
  id: string;
  title: string;
  status: string;
  type: string;
  created_at: string;
  script_id?: string;
  client_id?: string;
  scheduled_at?: string;
};

type SimpleLead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status?: string;
};

type SimpleScript = {
  id: string;
  title: string;
  content: string;
};

export default function ManageCampaigns() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<SimpleCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignLeads, setCampaignLeads] = useState<Record<string, SimpleLead[]>>({});
  const [campaignScripts, setCampaignScripts] = useState<Record<string, SimpleScript>>({});
  
  // New campaign form state
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  
  // Send campaign state
  const [selectedCampaign, setSelectedCampaign] = useState<SimpleCampaign | null>(null);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [messageType, setMessageType] = useState<"email" | "sms">("email");
  
  // Load campaigns
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
      
      // Fetch leads and scripts for each campaign
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

  const handleCreateCampaign = async () => {
    try {
      if (!campaignName || !subject || !content) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill out all fields."
        });
        return;
      }

      // First create a script
      const { data: scriptData, error: scriptError } = await supabase
        .from("scripts")
        .insert({
          title: subject,
          content: content,
          type: "email"
        })
        .select();

      if (scriptError) throw scriptError;
      
      const newScript = scriptData[0];

      // Then create the campaign linked to the script
      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          title: campaignName,
          status: "draft",
          type: "email",
          script_id: newScript.id
        })
        .select();

      if (campaignError) throw campaignError;

      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully."
      });

      // Clear form
      setCampaignName("");
      setSubject("");
      setContent("");
      
      // Refresh campaigns list
      fetchCampaigns();
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create campaign."
      });
    }
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
        // Refresh campaigns to update status
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
          {/* Campaigns List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No campaigns found. Create one now!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map(campaign => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.title}</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs capitalize ${
                            campaign.status === 'sent' 
                              ? 'bg-green-100 text-green-800' 
                              : campaign.status === 'draft' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(campaign.created_at)}</TableCell>
                        <TableCell>{campaignLeads[campaign.id]?.length || 0}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={campaign.status === 'sent'}
                                onClick={() => setSelectedCampaign(campaign)}
                              >
                                Send
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Send Campaign</AlertDialogTitle>
                                <AlertDialogDescription>
                                  You're about to send "{campaign.title}" to {campaignLeads[campaign.id]?.length || 0} leads.
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
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          {/* Create Campaign Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Campaign Name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
              <Input
                placeholder="Email Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Textarea
                rows={8}
                placeholder="Email Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button onClick={handleCreateCampaign}>Create Campaign</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
