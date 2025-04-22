
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

interface AgentCallLogsProps {
  agentId: string;
}

export function AgentCallLogs({ agentId }: AgentCallLogsProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("ai_agent_logs")
        .select("*")
        .eq("agent_id", agentId)
        .order("timestamp", { ascending: false });

      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    };

    fetchLogs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("agent-logs-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ai_agent_logs",
          filter: `agent_id=eq.${agentId}`,
        },
        (payload) => {
          setLogs((currentLogs) => [payload.new, ...currentLogs]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading logs...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <AlertCircle className="h-4 w-4" />
        No call logs found for this agent
      </div>
    );
  }

  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Phone Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.phone}</TableCell>
              <TableCell className="capitalize">{log.status}</TableCell>
              <TableCell>
                {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
