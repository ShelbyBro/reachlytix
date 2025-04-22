import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoaderIcon } from "lucide-react";
import { MyAgentList } from "./MyAgentList";
import { greetingScriptPresets, voiceStyles, businessTypes } from "./agent-constants";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

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
  const [leadListInput, setLeadListInput] = useState("");

  const handleVoiceStyleChange = (value: string) => {
    setVoiceStyle(value);
    setGreetingScript(greetingScriptPresets[value][businessType] || "");
  };

  const handleBusinessTypeChange = (value: string) => {
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
    const leadList = leadListInput
      .split(",")
      .map(number => number.trim())
      .filter(number => number);

    const { error } = await supabase.from("ai_agents").insert([
      {
        name,
        voice_style: voiceStyle,
        business_type: businessType,
        greeting_script: greetingScript,
        client_id: user.id,
        status: "pending",
        lead_list: leadList
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
        title: "Agent saved successfully!",
        description: "Your AI calling agent has been created.",
      });
      resetForm();
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-2xl mt-8 flex items-center justify-center">
        <Card className="p-8 opacity-60 text-center">
          <div className="text-lg font-semibold">Please log in to create your AI Agent.</div>
        </Card>
      </div>
    );
  }

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
              <Select value={voiceStyle} onValueChange={handleVoiceStyleChange} disabled={loading}>
                <SelectTrigger id="voice-style">
                  <SelectValue placeholder="Select voice style" />
                </SelectTrigger>
                <SelectContent>
                  {voiceStyles.map(vs => (
                    <SelectItem key={vs.value} value={vs.value}>
                      {vs.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="business-type">Business Type</Label>
              <Select value={businessType} onValueChange={handleBusinessTypeChange} disabled={loading}>
                <SelectTrigger id="business-type">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(bt => (
                    <SelectItem key={bt.value} value={bt.value}>
                      {bt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <LeadListInput
            value={leadListInput}
            onChange={setLeadListInput}
          />
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
