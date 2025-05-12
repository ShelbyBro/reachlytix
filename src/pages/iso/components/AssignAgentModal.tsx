
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { IsoLead } from "./IsoLeadsTable";

interface Agent {
  id: string;
  name: string;
}

interface AssignAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLead: IsoLead | null;
  onAssignSuccess: () => void;
}

export function AssignAgentModal({ open, onOpenChange, selectedLead, onAssignSuccess }: AssignAgentModalProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available agents
  useEffect(() => {
    if (open) {
      fetchAgents();
    }
  }, [open]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedAgentId("");
    }
  }, [open]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('id, name')
        .eq('status', 'active');

      if (error) {
        throw error;
      }

      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load available agents");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedLead || !selectedAgentId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('iso_leads')
        .update({ assigned_agent_id: selectedAgentId })
        .eq('id', selectedLead.id);

      if (error) {
        throw error;
      }

      toast.success("Agent assigned successfully");
      onAssignSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning agent:", error);
      toast.error("Failed to assign agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Agent</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="text-center py-4">Loading available agents...</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-4 text-amber-600">
              No available agents right now.
            </div>
          ) : (
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name || `Agent ${agent.id.substring(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignAgent} 
            disabled={!selectedAgentId || isSubmitting || agents.length === 0}
          >
            {isSubmitting ? "Assigning..." : "Assign Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
