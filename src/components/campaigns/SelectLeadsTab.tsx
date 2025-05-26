
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lead } from "@/types/campaign";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

type SelectLeadsTabProps = {
  campaignId: string;
  onLeadsAssigned?: () => void;
  initialSelectedLeadIds?: string[];
};

export function SelectLeadsTab({ campaignId, onLeadsAssigned, initialSelectedLeadIds }: SelectLeadsTabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<string[]>(initialSelectedLeadIds || []);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch leads that belong to this client
  useEffect(() => {
    async function fetchLeads() {
      setIsLoading(true);
      if (!user) {
        setLeads([]);
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("client_id", user.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch leads",
          description: error.message,
        });
        setLeads([]);
      } else if (data) {
        setLeads(data);
      }
      setIsLoading(false);
    }
    fetchLeads();
  }, [user]);

  // Reload assigned leads when campaignId changes
  useEffect(() => {
    async function fetchAssignedLeads() {
      if (!campaignId) return;
      const { data, error } = await supabase
        .from("campaign_leads")
        .select("lead_id")
        .eq("campaign_id", campaignId);

      if (data) setSelected(data.map(d => d.lead_id));
    }
    if (campaignId) fetchAssignedLeads();
  }, [campaignId]);

  const toggleSelected = (leadId: string) => {
    setSelected((old) => old.includes(leadId) ? old.filter(id => id !== leadId) : [...old, leadId]);
  };

  const handleSave = async () => {
    setSaving(true);
    if (selected.length === 0) {
      toast({
        variant: "destructive",
        title: "No leads selected",
        description: "Please select at least one lead to assign.",
      });
      setSaving(false);
      return;
    }
    // Remove all existing campaign_leads for this campaign
    const { error: delError } = await supabase
      .from("campaign_leads")
      .delete()
      .eq("campaign_id", campaignId);

    // Re-insert selected
    const toInsert = selected.map((lead_id) => ({
      campaign_id: campaignId,
      lead_id
    }));
    let insError = undefined;
    if (toInsert.length) {
      const { error } = await supabase.from("campaign_leads").insert(toInsert);
      insError = error;
    }
    setSaving(false);

    if (!delError && !insError) {
      toast({
        title: "Leads assigned successfully",
        description: "Leads have been assigned to this campaign.",
      });
      if (onLeadsAssigned) onLeadsAssigned();
    } else {
      toast({
        variant: "destructive",
        title: "Error assigning leads",
        description: delError?.message ?? insError?.message,
      });
    }
  };

  return (
    <div>
      <div className="mb-2 font-semibold">Select which uploaded leads should receive this campaign:</div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Loader2 className="animate-spin" /> Loading leads...
        </div>
      ) : leads.length === 0 ? (
        <div className="text-sm text-muted-foreground p-4 text-center">No leads found. Upload leads or add some first.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Select</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map(lead => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Checkbox checked={selected.includes(lead.id)} onCheckedChange={() => toggleSelected(lead.id)} />
                </TableCell>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone ?? "-"}</TableCell>
                <TableCell>{lead.status ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="flex justify-end mt-4">
        <Button onClick={handleSave} disabled={saving || leads.length === 0}>
          {saving ? "Assigning..." : "Assign Selected Leads"}
        </Button>
      </div>
    </div>
  );
}

