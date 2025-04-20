
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

type Agent = {
  id: string;
  campaign_id: string | null;
  status: string | null;
  created_at: string | null;
  notes: string | null;
};

type CampaignMap = { [id: string]: string };

export function AgentTable() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaigns").select("id, title");
      if (error) throw error;
      return (data ?? []) as { id: string; title: string }[];
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["ai_agents", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Agent[];
    },
    enabled: !!userId,
  });

  // Map campaign id to title
  const campaignMap: CampaignMap = {};
  campaigns?.forEach((c) => (campaignMap[c.id] = c.title));

  return (
    <div className="rounded-xl bg-card shadow-md p-1 sm:p-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                </TableRow>
              ))
            : data && data.length > 0 ? (
                data.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      {campaignMap[agent.campaign_id ?? ""] ?? (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={agent.status} />
                    </TableCell>
                    <TableCell>
                      {agent.created_at
                        ? new Date(agent.created_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {agent.notes ?? <span className="text-muted-foreground italic">–</span>}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex gap-2 items-center text-sm text-muted-foreground py-4">
                      <AlertCircle className="w-5 h-5" /> No AI agents found.
                    </div>
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  let color: "default" | "destructive" | "secondary" | "outline" = "default";
  let label = status ?? "pending";
  switch (status) {
    case "active":
      color = "default";
      label = "Active";
      break;
    case "pending":
      color = "secondary";
      label = "Pending";
      break;
    case "failed":
      color = "destructive";
      label = "Failed";
      break;
    case "completed":
      color = "default";
      label = "Completed";
      break;
    default:
      color = "outline";
      label = status ?? "Pending";
  }
  return (
    <Badge variant={color} className="capitalize">
      {label}
    </Badge>
  );
}
