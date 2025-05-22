
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "unassigned", label: "Unassigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
  { value: "follow_up", label: "Follow-Up" },
];

export default function AddIsoLeadDialog({
  open,
  onOpenChange,
  onSuccess,
  isoId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
  isoId: string | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("unassigned");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !isoId) {
      toast({ description: "Name, Email, and ISO must be set.", title: "Missing Info" });
      return;
    }
    setLoading(true);
    // Step 1: Add to leads
    const { data: leadInsert, error: leadError } = await supabase
      .from("leads")
      .insert([{
        name, email, phone,
      }])
      .select("id")
      .maybeSingle();

    if (leadError || !leadInsert) {
      setLoading(false);
      toast({ title: "Failed to add lead", description: leadError?.message || "Could not add lead" });
      return;
    }
    const leadId = leadInsert.id;

    // Step 2: Insert new ISO lead (reference lead_id and iso_id only, plus status)
    const { error: isoLeadError } = await supabase.from("iso_leads").insert([{
      lead_id: leadId,
      iso_id: isoId,
      status,
    }]);

    setLoading(false);
    if (isoLeadError) {
      toast({ title: "Failed to add ISO lead", description: isoLeadError.message });
    } else {
      toast({ title: "ISO Lead added" });
      setName("");
      setEmail("");
      setPhone("");
      setStatus("unassigned");
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New ISO Lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Name *" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue>
                {STATUS_OPTIONS.find(o => o.value === status)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
