
import React, { useState } from "react";
import { formatDate } from "@/utils/campaign-utils";
import { SimpleCampaign, SimpleLead } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Mail, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CampaignListProps {
  campaigns: SimpleCampaign[];
  campaignsLoading: boolean;
  campaignLeads: Record<string, SimpleLead[]>;
  onSendCampaign: (campaign: SimpleCampaign) => void;
  onDeleteCampaign: (id: string) => void;
  onEditCampaign: (campaign: SimpleCampaign) => void;
}

export function CampaignList({ 
  campaigns, 
  campaignsLoading, 
  campaignLeads,
  onSendCampaign,
  onDeleteCampaign,
  onEditCampaign
}: CampaignListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignToDelete, setCampaignToDelete] = useState<SimpleCampaign | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    statusFilter === "all" || campaign.schedule_status === statusFilter
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Leads</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCampaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">
                {campaign.title}
                {campaign.description && (
                  <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(campaign.schedule_status || 'draft')}>
                  {campaign.schedule_status || 'draft'}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(campaign.created_at)}</TableCell>
              <TableCell>
                {campaign.scheduled_at ? formatDate(campaign.scheduled_at) : '-'}
              </TableCell>
              <TableCell>{campaignLeads[campaign.id]?.length || 0}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEditCampaign(campaign)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onSendCampaign(campaign)}
                    disabled={campaign.schedule_status === 'completed' || campaign.schedule_status === 'failed'}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => setCampaignToDelete(campaign)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Campaign</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete "{campaign.title}"? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCampaignToDelete(null)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            if (campaignToDelete) {
                              onDeleteCampaign(campaignToDelete.id);
                              setCampaignToDelete(null);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
