
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LeadListInput } from "./LeadListInput";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { voiceStyles, businessTypes, greetingScriptPresets } from "./agent-constants";

interface AgentFormFieldsProps {
  name: string;
  setName: (name: string) => void;
  voiceStyle: string;
  setVoiceStyle: (style: string) => void;
  businessType: string;
  setBusinessType: (type: string) => void;
  greetingScript: string;
  setGreetingScript: (script: string) => void;
  leadListInput: string;
  setLeadListInput: (list: string) => void;
  loading: boolean;
}

export function AgentFormFields({
  name,
  setName,
  voiceStyle,
  setVoiceStyle,
  businessType,
  setBusinessType,
  greetingScript,
  setGreetingScript,
  leadListInput,
  setLeadListInput,
  loading,
}: AgentFormFieldsProps) {
  const handleVoiceStyleChange = (value: string) => {
    setVoiceStyle(value);
    setGreetingScript(greetingScriptPresets[value][businessType] || "");
  };

  const handleBusinessTypeChange = (value: string) => {
    setBusinessType(value);
    setGreetingScript(greetingScriptPresets[voiceStyle][value] || "");
  };

  return (
    <>
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
          onChange={(e) => setGreetingScript(e.target.value)}
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
    </>
  );
}

