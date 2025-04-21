
import { AgentBuilderCard } from "@/components/ai-agents/AgentBuilderCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "react-router-dom";

export default function AiAgentsPage() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-background py-12 px-4">
      <div className="w-full max-w-2xl mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push('/lead-generator/smart-scrape')}
        >
          Lead Generator
        </Button>
      </div>
      <AgentBuilderCard />
    </div>
  );
}
