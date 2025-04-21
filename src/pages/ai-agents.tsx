
import { AgentBuilderCard } from "@/components/ai-agents/AgentBuilderCard";
import { AgentLogsTable } from "@/components/ai-agents/AgentLogsTable";

export default function AiAgentsPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background py-12 px-4">
      <div className="w-full max-w-2xl mb-6">
        <h1 className="text-3xl font-bold">AI Agents</h1>
      </div>
      <AgentBuilderCard />
      <AgentLogsTable />
    </div>
  );
}
