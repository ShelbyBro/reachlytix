
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AddIsoLeadDialog({
  open,
  onOpenChange,
  onSuccess,
  userId
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
  userId: string | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("new");
  const [assignedIsoAgent, setAssignedIsoAgent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !userId) {
      toast({ description: "Name, Email, and User must be set.", title: "Missing Info" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("iso_leads").insert([
      {
        name,
        email,
        phone,
        status,
        assigned_iso_agent: assignedIsoAgent ? assignedIsoAgent : null,
        created_by: userId,
        date_added: new Date().toISOString(),
      },
    ]);
    setLoading(false);
    if (error) {
      toast({ title: "Failed to add lead", description: error.message });
    } else {
      toast({ title: "Lead added" });
      setName("");
      setEmail("");
      setPhone("");
      setStatus("new");
      setAssignedIsoAgent("");
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
              <SelectValue>{STATUS_OPTIONS.find(o => o.value === status)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Assigned ISO Agent" value={assignedIsoAgent} onChange={e => setAssignedIsoAgent(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
