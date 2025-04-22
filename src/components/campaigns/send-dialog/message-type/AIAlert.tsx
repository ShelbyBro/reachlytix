
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bot } from "lucide-react";

export function AIAlert() {
  return (
    <Alert className="mt-4 bg-purple-50 border-purple-200">
      <Bot className="h-4 w-4" />
      <AlertTitle>AI Agent Campaign</AlertTitle>
      <AlertDescription>
        This campaign will be executed by an AI calling agent. Make sure your campaign script and agent setup are complete.
      </AlertDescription>
    </Alert>
  );
}
