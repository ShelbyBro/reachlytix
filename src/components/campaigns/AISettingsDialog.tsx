
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AISettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const aiModels = [
  { id: "gemini", name: "Google Gemini", apiKeyName: "Gemini API Key" },
  { id: "openai", name: "OpenAI", apiKeyName: "OpenAI API Key" }
];

export function AISettingsDialog({
  open,
  onOpenChange,
  selectedModel,
  onModelChange,
  apiKey,
  onApiKeyChange
}: AISettingsDialogProps) {
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Assistant Settings</DialogTitle>
          <DialogDescription>
            Configure your preferred AI model and API key for generating campaign content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ai-model">AI Model</Label>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger id="ai-model">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {aiModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="api-key">
              {aiModels.find(m => m.id === selectedModel)?.apiKeyName || "API Key"}
            </Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Enter your API key"
            />
            <p className="text-xs text-muted-foreground">
              {selectedModel === "gemini" && "Optional: Leave blank to use default key"}
              {selectedModel === "openai" && "Required: Enter your OpenAI API key to use this model"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            onOpenChange(false);
            if (apiKey) {
              toast({
                title: "API Key Saved",
                description: `${selectedModel === "gemini" ? "Gemini" : "OpenAI"} API key has been saved for this session.`
              });
            }
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
