
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SimpleCampaign, SimpleLead } from "@/types/campaign";
import { formatDate } from "@/utils/campaign-utils";
import { SendCampaignDialog } from "./SendCampaignDialog";

interface CampaignListProps {
  campaigns: SimpleCampaign[];
  campaignsLoading: boolean;
  campaignLeads: Record<string, SimpleLead[]>;
  onSendCampaign: (campaign: SimpleCampaign) => void;
}

export function CampaignList({ 
  campaigns, 
  campaignsLoading, 
  campaignLeads,
  onSendCampaign 
}: CampaignListProps) {
  return (
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={campaign.status === 'sent'}
                      onClick={() => onSendCampaign(campaign)}
                    >
                      Send
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
