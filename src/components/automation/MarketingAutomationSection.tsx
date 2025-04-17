
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutomationForm } from "./AutomationForm";
import { AutomationsList } from "./AutomationsList";
import { Sparkles } from "lucide-react";

export function MarketingAutomationSection() {
  const [activeTab, setActiveTab] = useState("create");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAutomationCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab("list");
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Marketing Automation
        </CardTitle>
        <CardDescription>
          Create and manage automated marketing workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="list">Your Automations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <AutomationForm onSuccess={handleAutomationCreated} />
          </TabsContent>
          
          <TabsContent value="list">
            <AutomationsList refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
