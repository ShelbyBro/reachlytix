
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export function AgentLogsTable() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["agent_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_agent_logs")
        .select(`
          *,
          ai_agents (
            name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading logs...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Recent Agent Campaigns</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.ai_agents?.name || "Unknown Agent"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {log.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : log.status === "failed" ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  {log.status}
                </div>
              </TableCell>
              <TableCell>{log.phone}</TableCell>
              <TableCell>
                {new Date(log.timestamp).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
