
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, Trash2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Automation {
  id: string;
  title: string;
  trigger_type: "source" | "campaign" | "time_delay";
  trigger_value: string;
  action_type: "email" | "sms";
  message_body: string;
  status: "active" | "paused";
  created_at: string;
}

export function AutomationsList({ refreshTrigger }: { refreshTrigger: number }) {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomations();
  }, [refreshTrigger]);

  async function fetchAutomations() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("automations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAutomations(data as Automation[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch automations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: "active" | "paused") {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active";
      const { error } = await supabase
        .from("automations")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      setAutomations(automations.map(auto => 
        auto.id === id ? { ...auto, status: newStatus } : auto
      ));
      
      toast({
        title: "Status updated",
        description: `Automation is now ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update automation status",
        variant: "destructive",
      });
    }
  }

  async function deleteAutomation(id: string) {
    if (!window.confirm("Are you sure you want to delete this automation?")) return;
    
    try {
      const { error } = await supabase
        .from("automations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setAutomations(automations.filter(auto => auto.id !== id));
      
      toast({
        title: "Deleted",
        description: "Automation has been deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete automation",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (automations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No automations found. Create your first one above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {automations.map((automation) => (
            <TableRow key={automation.id}>
              <TableCell className="font-medium">{automation.title}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <Badge variant="outline" className="w-fit mb-1">
                    {automation.trigger_type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {automation.trigger_value}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={automation.action_type === "email" ? "default" : "secondary"} className="w-fit">
                  {automation.action_type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={automation.status === "active" ? "outline" : "secondary"}
                  className={`w-fit ${automation.status === "active" ? "bg-green-100 text-green-800" : ""}`}
                >
                  {automation.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => toggleStatus(automation.id, automation.status)}
                  title={automation.status === "active" ? "Pause" : "Activate"}
                >
                  {automation.status === "active" ? 
                    <Pause className="h-4 w-4" /> : 
                    <Play className="h-4 w-4" />
                  }
                </Button>
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => deleteAutomation(automation.id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
