
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw, Trash } from "lucide-react";
import { ProgressTracker } from "@/components/ai-agents/ProgressTracker";
import { AgentCallLogs } from "@/components/ai-agents/AgentCallLogs";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    status: string;
    business_type: string | null;
    voice_style: string | null;
    created_at: string;
    client_id: string | null;
    current_index: number;
    lead_list: string;
  };
  onToggleStatus: (agent: any) => Promise<void>;
  onReset: (agent: any) => void;
  onDelete: (id: string, name: string) => Promise<void>;
  updatingStatus: boolean;
  getStatusBadgeVariant: (status: string) => string;
  countLeads: (leadList: string) => number;
}

export function AgentCard({
  agent,
  onToggleStatus,
  onReset,
  onDelete,
  updatingStatus,
  getStatusBadgeVariant,
  countLeads,
}: AgentCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{agent.name || "Unnamed Agent"}</CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Business: {agent.business_type || "Not specified"} | Voice: {agent.voice_style || "Default"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(agent.status) as any} className="capitalize">
              {agent.status}
            </Badge>
            <div className="text-sm font-medium">
              Total Leads: {countLeads(agent.lead_list)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground flex justify-between">
            <span>Created: {new Date(agent.created_at).toLocaleDateString()}</span>
            <span>Client ID: {agent.client_id || "No client"}</span>
          </div>
          <ProgressTracker 
            currentIndex={agent.current_index} 
            leadList={agent.lead_list} 
          />
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <h3 className="text-sm font-medium">Call Logs</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={updatingStatus || agent.status === 'completed'}
              onClick={() => onToggleStatus(agent)}
            >
              {agent.status === 'running' ? (
                <><Pause className="h-4 w-4 mr-1" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-1" /> Resume</>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReset(agent)}
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Reset
            </Button>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(agent.id, agent.name || "Unnamed Agent")}
            >
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <AgentCallLogs agentId={agent.id} />
        </div>
      </CardContent>
    </Card>
  );
}
