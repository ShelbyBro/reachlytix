
import React from "react";
import { formatDate } from "@/utils/campaign-utils";
import { Campaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface CampaignTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onSelectCampaign: (campaign: Campaign) => void;
}

export function CampaignTable({ campaigns, isLoading, onSelectCampaign }: CampaignTableProps) {
  return (
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSelectCampaign(campaign)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
