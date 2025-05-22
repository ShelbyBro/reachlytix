
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function NewIsoAppDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: { lead_name: string; requested_amount: number; assigned_processor?: string }) => Promise<void>;
  loading: boolean;
}) {
  const [leadName, setLeadName] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [assignedProcessor, setAssignedProcessor] = useState("");

  const handleSubmit = async () => {
    if (!leadName || !requestedAmount) {
      toast({ title: "Missing info", description: "Lead name and requested amount are required." });
      return;
    }
    await onSubmit({
      lead_name: leadName,
      requested_amount: parseFloat(requestedAmount),
      assigned_processor: assignedProcessor,
    });
    setLeadName("");
    setRequestedAmount("");
    setAssignedProcessor("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl max-w-md bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>New Loan Application</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Lead Name"
            value={leadName}
            onChange={e => setLeadName(e.target.value)}
            disabled={loading}
          />
          <Input
            placeholder="Requested Amount"
            type="number"
            value={requestedAmount}
            onChange={e => setRequestedAmount(e.target.value)}
            min={0}
            disabled={loading}
          />
          <Input
            placeholder="Assigned Processor (optional)"
            value={assignedProcessor}
            onChange={e => setAssignedProcessor(e.target.value)}
            disabled={loading}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary"
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
