
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Send, BarChart3, Check, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/campaign-utils";

export default function Campaigns() {
  const { toast } = useToast();
  
  // Fetch campaign data
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");
        
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }
    }
  });
  
  useEffect(() => {
    if (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error loading campaigns",
        description: "There was a problem fetching your campaigns.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  const activeCampaigns = campaigns?.filter(c => c.status !== 'completed' && c.status !== 'cancelled') || [];
  const completedCampaigns = campaigns?.filter(c => c.status === 'completed') || [];
  const draftCampaigns = campaigns?.filter(c => c.schedule_status === 'draft') || [];
  const scheduledCampaigns = campaigns?.filter(c => c.schedule_status === 'scheduled') || [];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Campaign Manager</h1>
            <p className="text-muted-foreground">
              Create and manage marketing campaigns
            </p>
          </div>
          
          <Button className="bg-purple-600 hover:bg-purple-700" asChild>
            <Link to="/campaigns/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all statuses
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCampaigns.length}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Currently running campaigns
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCampaigns.length}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Successfully delivered
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledCampaigns.length}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Upcoming campaigns
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Campaigns</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : campaigns?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <Send className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No campaigns found</p>
                  <Button asChild>
                    <Link to="/campaigns/create">Create Your First Campaign</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns?.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            {activeCampaigns.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <p className="text-muted-foreground">No active campaigns</p>
                  <Button variant="link" asChild>
                    <Link to="/campaigns/create">Create one now</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="scheduled" className="space-y-4">
            {scheduledCampaigns.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <p className="text-muted-foreground">No scheduled campaigns</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scheduledCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="draft" className="space-y-4">
            {draftCampaigns.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <p className="text-muted-foreground">No draft campaigns</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {draftCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

interface Campaign {
  id: string;
  title: string;
  description?: string;
  status?: string;
  schedule_status?: string;
  type?: string;
  scheduled_at?: string;
  created_at?: string;
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const getStatusBadge = () => {
    if (campaign.status === 'completed') {
      return <Badge variant="success" className="bg-green-100 text-green-800">Completed</Badge>;
    }
    
    if (campaign.status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    
    if (campaign.status === 'active') {
      return <Badge>Active</Badge>;
    }
    
    if (campaign.schedule_status === 'scheduled') {
      return <Badge variant="secondary">Scheduled</Badge>;
    }
    
    return <Badge variant="outline">Draft</Badge>;
  };
  
  const getIcon = () => {
    if (campaign.type === 'email') {
      return <Send className="h-5 w-5" />;
    }
    
    if (campaign.type === 'sms') {
      return <Send className="h-5 w-5" />;
    }
    
    return <BarChart3 className="h-5 w-5" />;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="space-y-1">
            <CardTitle>{campaign.title || "Untitled Campaign"}</CardTitle>
            <CardDescription>
              {campaign.type || "General"} • Created {campaign.created_at ? formatDate(campaign.created_at) : "recently"}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {campaign.description || "No description provided."}
        </p>
        
        {campaign.scheduled_at && (
          <div className="flex items-center mt-4 text-sm">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>Scheduled for {formatDate(campaign.scheduled_at)}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/campaigns/${campaign.id}`}>
              View Details
            </Link>
          </Button>
          
          {campaign.schedule_status === 'draft' && (
            <Button size="sm" asChild>
              <Link to={`/campaigns/${campaign.id}/edit`}>
                Edit Campaign
              </Link>
            </Button>
          )}
          
          {campaign.schedule_status === 'scheduled' && (
            <Button size="sm" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Reschedule
            </Button>
          )}
          
          {campaign.status === 'active' && (
            <span className="text-sm text-muted-foreground flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              Running
            </span>
          )}
          
          {campaign.status === 'completed' && (
            <span className="text-sm text-muted-foreground flex items-center">
              <Check className="h-4 w-4 mr-1 text-green-500" />
              Completed
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
