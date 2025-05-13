
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RejectDialog } from "./RejectDialog";

interface AdminApplication {
  id: string;
  merchant_id: string;
  lender_id: string;
  iso_id: string;
  status: string;
  notes?: string;
  created_at: string;
  merchant_name?: string;
  lender_name?: string;
  iso_name?: string;
}

interface AdminApplicationsTableProps {
  applications: AdminApplication[];
  isLoading: boolean;
  onStatusUpdate: () => Promise<void>;
}

export function AdminApplicationsTable({ 
  applications, 
  isLoading,
  onStatusUpdate
}: AdminApplicationsTableProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AdminApplication | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2">Loading applications...</span>
      </div>
    );
  }
  
  if (applications.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No applications found.</p>
      </div>
    );
  }

  const handleApprove = async (application: AdminApplication) => {
    try {
      setIsUpdating(application.id);
      
      const { error } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', application.id);
      
      if (error) throw error;
      
      await onStatusUpdate();
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error("Failed to approve application");
    } finally {
      setIsUpdating(null);
    }
  };

  const openRejectDialog = (application: AdminApplication) => {
    setSelectedApplication(application);
    setRejectDialogOpen(true);
  };
  
  const handleReject = async (reason: string) => {
    if (!selectedApplication) return;
    
    try {
      setIsUpdating(selectedApplication.id);
      
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          notes: reason || 'No reason provided'
        })
        .eq('id', selectedApplication.id);
      
      if (error) throw error;
      
      setRejectDialogOpen(false);
      await onStatusUpdate();
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Failed to reject application");
    } finally {
      setIsUpdating(null);
      setSelectedApplication(null);
    }
  };
  
  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Merchant</TableHead>
              <TableHead>Lender</TableHead>
              <TableHead>ISO</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.merchant_name}</TableCell>
                <TableCell>{application.lender_name}</TableCell>
                <TableCell>{application.iso_name}</TableCell>
                <TableCell>
                  <StatusBadge status={application.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatCreatedAt(application.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  {application.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRejectDialog(application)}
                        disabled={!!isUpdating}
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        {isUpdating === application.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(application)}
                        disabled={!!isUpdating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isUpdating === application.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Approve
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end items-center gap-2">
                      {application.notes && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-muted-foreground"
                          title={application.notes}
                        >
                          <Info className="w-4 h-4" />
                          <span className="sr-only">View notes</span>
                        </Button>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {application.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RejectDialog 
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onReject={handleReject}
      />
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" = "default";
  
  switch (status.toLowerCase()) {
    case "approved":
      variant = "success";
      break;
    case "pending":
      variant = "secondary";
      break;
    case "rejected":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{status}</Badge>;
}

function formatCreatedAt(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return dateString;
  }
}
