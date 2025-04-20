
import { Bot, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FeatureCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3 mb-6">
      <Link to="/ai-agents" className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI Agent Zone</CardTitle>
              <Bot className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-sm text-muted-foreground">
              Create and manage AI phone agents to handle calls and generate leads.
            </div>
            <div className="mt-4 text-xs flex items-center text-primary">
              View AI agents <ArrowUpRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
