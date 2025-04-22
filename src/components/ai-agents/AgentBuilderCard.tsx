
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoaderIcon } from "lucide-react";
import { MyAgentList } from "./MyAgentList";
import { AgentFormFields } from "./AgentFormFields";
import { voiceStyles, businessTypes, greetingScriptPresets } from "./agent-constants";

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

  const resetForm = () => {
    setName("");
    setVoiceStyle(voiceStyles[0].value);
    setBusinessType(businessTypes[0].value);
    setGreetingScript(greetingScriptPresets[voiceStyles[0].value][businessTypes[0].value]);
    setLeadListInput("");
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
    
    // Process the leadListInput to create an array of phone numbers
    const leadList = leadListInput
      .split(",")
      .map(number => number.trim())
      .filter(number => number);

    try {
      const { error } = await supabase
        .from("ai_agents")
        .insert({
          name,
          voice_style: voiceStyle,
          business_type: businessType,
          greeting_script: greetingScript,
          client_id: user.id,
          status: "pending",
          lead_list: leadList
        });

      if (error) {
        console.error("Error saving agent:", error);
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
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Unexpected error",
        description: "Something went wrong while saving your agent.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <AgentFormFields
            name={name}
            setName={setName}
            voiceStyle={voiceStyle}
            setVoiceStyle={setVoiceStyle}
            businessType={businessType}
            setBusinessType={setBusinessType}
            greetingScript={greetingScript}
            setGreetingScript={setGreetingScript}
            leadListInput={leadListInput}
            setLeadListInput={setLeadListInput}
            loading={loading}
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
