
import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CallLogRow } from "./CallLogRow";
import { supabase } from "@/integrations/supabase/client";

interface CallLog {
  id: string;
  timestamp: string;
  status: string;
  number: string;
  agent_id: string | null;
  notes: string | null;
}

export function CallsTable() {
  const [calls, setCalls] = useState<CallLog[]>([]);

  useEffect(() => {
    const fetchCalls = async () => {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (!error && data) {
        setCalls(data);
      }
    };

    fetchCalls();

    // Subscribe to new call logs
    const channel = supabase
      .channel('call_logs_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'call_logs' },
        (payload) => {
          setCalls(prevCalls => [payload.new as CallLog, ...prevCalls].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Number</TableHead>
          <TableHead>Assigned Agent</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.map((call) => (
          <CallLogRow
            key={call.id}
            timestamp={call.timestamp}
            status={call.status}
            number={call.number}
            notes={call.notes}
          />
        ))}
      </TableBody>
    </Table>
  );
}
