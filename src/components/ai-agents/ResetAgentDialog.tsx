
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ResetAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  agentName: string;
  loading?: boolean;
}

export function ResetAgentDialog({
  open,
  onOpenChange,
  onConfirm,
  agentName,
  loading = false,
}: ResetAgentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Agent</DialogTitle>
          <DialogDescription>
            Are you sure you want to reset {agentName}? This will clear all progress
            and the agent will start from the beginning.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {loading ? "Resetting..." : "Reset Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
