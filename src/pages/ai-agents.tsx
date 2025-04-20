
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AgentTable } from "@/components/ai-agents/AgentTable";
import { AgentRequestForm } from "@/components/ai-agents/AgentRequestForm";
import { Shield } from "lucide-react";

export default function AiAgentsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold gradient-text">AI Calling Agents</h1>
      </div>
      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="agents">📞 My Agents</TabsTrigger>
          <TabsTrigger value="request">➕ Request Agent</TabsTrigger>
        </TabsList>
        <TabsContent value="agents">
          <AgentTable />
        </TabsContent>
        <TabsContent value="request">
          <AgentRequestForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
