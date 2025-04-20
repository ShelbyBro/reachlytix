
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

type Agent = {
  id: string;
  name: string;
  voice_style: string;
  business_type: string;
  greeting_script: string;
  created_at: string | null;
};

export function MyAgentList() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["ai_agents_custom", userId],
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

  return (
    <div className="mt-2">
      <h3 className="text-xl font-semibold mb-3">My Saved Agents</h3>
      <div>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-4 flex flex-col gap-2">
                <div className="flex gap-3 items-center">
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-6 w-full" />
              </Card>
            ))}
          </div>
        ) : data && data.length ? (
          <div className="flex flex-col gap-4">
            {data.map(agent => (
              <Card key={agent.id} className="p-4">
                <div className="flex gap-3 items-center mb-2">
                  <div className="font-bold text-lg">{agent.name}</div>
                  <Badge variant="secondary" className="capitalize">{agent.voice_style}</Badge>
                  <Badge variant="outline" className="capitalize">{agent.business_type}</Badge>
                  <div className="ml-auto text-xs text-muted-foreground">{agent.created_at ? new Date(agent.created_at).toLocaleString() : ""}</div>
                </div>
                <div className="italic text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                  {agent.greeting_script}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 items-center text-sm text-muted-foreground py-4">
            <AlertCircle className="w-5 h-5" /> No agents found.
          </div>
        )}
      </div>
    </div>
  );
}
