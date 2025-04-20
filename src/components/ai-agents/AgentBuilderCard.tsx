
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoaderIcon, Check } from "lucide-react";
import { MyAgentList } from "./MyAgentList";
import { greetingScriptPresets, voiceStyles, businessTypes } from "./agent-constants";

export function AgentBuilderCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [voiceStyle, setVoiceStyle] = useState(voiceStyles[0].value);
  const [businessType, setBusinessType] = useState(businessTypes[0].value);
  const [greetingScript, setGreetingScript] = useState(
    greetingScriptPresets[voiceStyles[0].value][businessTypes[0].value]
  );
  const [loading, setLoading] = useState(false);

  // Auto-update greeting script on dropdown changes
  const handleVoiceStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setVoiceStyle(value);
    setGreetingScript(greetingScriptPresets[value][businessType] || "");
  };

  const handleBusinessTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setBusinessType(value);
    setGreetingScript(greetingScriptPresets[voiceStyle][value] || "");
  };

  const handleGreetingScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGreetingScript(e.target.value);
  };

  const resetForm = () => {
    setName("");
    setVoiceStyle(voiceStyles[0].value);
    setBusinessType(businessTypes[0].value);
    setGreetingScript(greetingScriptPresets[voiceStyles[0].value][businessTypes[0].value]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Agent Name is required",
        variant: "destructive",
      });
      return;
    }
    if (!greetingScript.trim()) {
      toast({
        title: "Greeting Script is required",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      toast({
        title: "User not authenticated",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("ai_agents").insert([
      {
        name,
        voice_style: voiceStyle,
        business_type: businessType,
        greeting_script: greetingScript,
        client_id: user.id,
        status: "pending",
      },
    ]);
    setLoading(false);

    if (error) {
      toast({
        title: "Error saving agent",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Agent Saved!",
        description: "Your AI calling agent has been created.",
      });
      resetForm();
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <Card className="p-8 relative mb-10 shadow-lg border-2 border-brand-purple animate-glow"
        style={{
          boxShadow: "0 0 20px 5px #9b87f5, 0 0 60px 10px #9b87f533",
          borderImage: "linear-gradient(90deg, #9b87f5 0%, #b970f0 100%) 1"
        }}>
        <h2 className="text-2xl font-bold mb-5 gradient-text">AI Agent Builder</h2>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="agent-name">Agent Name</Label>
            <Input
              id="agent-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Agent Name"
              disabled={loading}
              maxLength={60}
            />
          </div>
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="voice-style">Voice Style</Label>
              <select
                id="voice-style"
                className="w-full mt-1 px-3 py-2 rounded-md border"
                value={voiceStyle}
                onChange={handleVoiceStyleChange}
                disabled={loading}
              >
                {voiceStyles.map(vs => (
                  <option key={vs.value} value={vs.value}>{vs.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Label htmlFor="business-type">Business Type</Label>
              <select
                id="business-type"
                className="w-full mt-1 px-3 py-2 rounded-md border"
                value={businessType}
                onChange={handleBusinessTypeChange}
                disabled={loading}
              >
                {businessTypes.map(bt => (
                  <option key={bt.value} value={bt.value}>{bt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="greeting-script">Agent Greeting Script</Label>
            <Textarea
              id="greeting-script"
              value={greetingScript}
              className="font-mono bg-muted"
              onChange={handleGreetingScriptChange}
              rows={4}
              disabled={loading}
            />
            <div className="text-xs text-muted-foreground mt-1">
              This script will be used when your agent greets contacts.
            </div>
          </div>
          <Button type="submit" className="mt-2 w-fit" disabled={loading}>
            {loading ? (
              <>
                <LoaderIcon className="animate-spin mr-2" /> Saving...
              </>
            ) : (
              <>Save Agent</>
            )}
          </Button>
        </form>
      </Card>
      <MyAgentList />
    </div>
  );
}
