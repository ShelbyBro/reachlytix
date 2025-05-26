
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lead } from "@/types/campaign";
import { useAuth } from "@/contexts/AuthContext";

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
        .eq("client_id", user.id); // ensure ownership
      if (data) setLeads(data);
      setIsLoading(false);
    }
    fetchLeads();
  }, [user]);

  // Load assigned leads when campaignId changes
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
        title: "Leads assigned to campaign",
        description: "Leads have been assigned to this campaign.",
      });
      if (onLeadsAssigned) onLeadsAssigned();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: delError?.message ?? insError?.message,
      });
    }
  };

  return (
    <div>
      <div className="mb-2 font-semibold">Select which uploaded leads should receive this campaign:</div>
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
      <div className="flex justify-end mt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Assigning..." : "Assign Selected Leads"}
        </Button>
      </div>
    </div>
  );
}
