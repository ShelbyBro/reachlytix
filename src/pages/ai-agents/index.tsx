
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AgentTable } from "@/components/ai-agents/AgentTable";
import { AgentRequestForm } from "@/components/ai-agents/AgentRequestForm";
import { AgentLogsTable } from "@/components/ai-agents/AgentLogsTable";
import { Shield, Bot } from "lucide-react";
import Layout from "@/components/layout";

export default function AiAgentsPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Bot className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">AI Agent Zone</h1>
        </div>
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="agents">📞 My Agents</TabsTrigger>
            <TabsTrigger value="request">➕ Request Agent</TabsTrigger>
            <TabsTrigger value="logs">📊 Call Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="agents">
            <AgentTable />
          </TabsContent>
          <TabsContent value="request">
            <AgentRequestForm />
          </TabsContent>
          <TabsContent value="logs">
            <AgentLogsTable />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
