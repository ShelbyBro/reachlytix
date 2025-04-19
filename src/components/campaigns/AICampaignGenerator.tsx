
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, AlertCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface AICampaignGeneratorProps {
  onGeneratedContent: (content: {
    email: string;
    sms: string;
    whatsapp: string;
  }) => void;
}

const businessTypes = [
  "E-commerce",
  "SaaS",
  "Real Estate",
  "Healthcare",
  "Professional Services",
  "Retail",
  "Education",
  "Other"
];

const campaignGoals = [
  "Lead Generation",
  "Sales Promotion",
  "Brand Awareness",
  "Customer Retention",
  "Product Launch",
  "Event Promotion"
];

const aiModels = [
  { id: "gemini", name: "Google Gemini", apiKeyName: "Gemini API Key" },
  { id: "openai", name: "OpenAI", apiKeyName: "OpenAI API Key" }
];

export function AICampaignGenerator({ onGeneratedContent }: AICampaignGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateContent = async () => {
    if (!businessType || !campaignGoal) {
      toast({
        title: "Missing Information",
        description: "Please select both business type and campaign goal.",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey && selectedModel === "openai") {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key for OpenAI.",
        variant: "destructive"
      });
      setShowApiKeyDialog(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let response;
      let data;
      
      // Use the appropriate API based on the selected model
      if (selectedModel === "gemini") {
        const apiKeyToUse = apiKey || 'AIzaSyAXfF5sFm0kmEHGJI780nDA_as6kCsyWMc'; // Fallback to default if not provided
        
        // Updated Gemini API endpoint and request format
        response = await fetch(
          'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + apiKeyToUse,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Generate a professional marketing campaign including:
                  1. Email copy
                  2. SMS version (shorter)
                  3. WhatsApp message
                  Based on:
                  Business Type: ${businessType}
                  Campaign Goal: ${campaignGoal}`
                }]
              }]
            })
          }
        );
        
        data = await response.json();
        
        console.log("Gemini API response:", data);
        
        if (!response.ok) {
          throw new Error(`API error: ${data.error?.message || 'Unknown error'}`);
        }
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('Invalid response format from AI');
        }
        
        const generatedText = data.candidates[0].content.parts[0].text;
        processGeneratedText(generatedText);
        
      } else if (selectedModel === "openai") {
        if (!apiKey) {
          setShowApiKeyDialog(true);
          setIsGenerating(false);
          return;
        }
        
        response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are a professional marketing content generator."
                },
                {
                  role: "user",
                  content: `Generate a professional marketing campaign including:
                  1. Email copy
                  2. SMS version (shorter)
                  3. WhatsApp message
                  Based on:
                  Business Type: ${businessType}
                  Campaign Goal: ${campaignGoal}`
                }
              ]
            })
          }
        );
        
        data = await response.json();
        
        console.log("OpenAI API response:", data);
        
        if (!response.ok) {
          throw new Error(`API error: ${data.error?.message || 'Unknown error'}`);
        }
        
        if (!data.choices?.[0]?.message?.content) {
          throw new Error('Invalid response format from AI');
        }
        
        const generatedText = data.choices[0].message.content;
        processGeneratedText(generatedText);
      }

    } catch (error: any) {
      console.error('Error generating content:', error);
      setError(error.message || "Failed to generate content");
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate campaign content. Please try again.",
        variant: "destructive"
      });
      
      // If Gemini fails, suggest switching to OpenAI
      if (selectedModel === "gemini") {
        toast({
          title: "Try OpenAI Instead",
          description: "Gemini API failed. Consider switching to OpenAI in the AI settings.",
          action: <Button variant="outline" size="sm" onClick={() => {
            setSelectedModel("openai");
            setShowApiKeyDialog(true);
          }}>Switch</Button>
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const processGeneratedText = (generatedText: string) => {
    // Parse the response into separate messages
    const emailMatch = generatedText.match(/Email copy:(.*?)(?=SMS version:|$)/s);
    const smsMatch = generatedText.match(/SMS version:(.*?)(?=WhatsApp message:|$)/s);
    const whatsappMatch = generatedText.match(/WhatsApp message:(.*?)$/s);

    onGeneratedContent({
      email: emailMatch?.[1]?.trim() ?? '',
      sms: smsMatch?.[1]?.trim() ?? '',
      whatsapp: whatsappMatch?.[1]?.trim() ?? ''
    });

    toast({
      title: "Content Generated",
      description: "AI has generated your campaign messages.",
    });
  };

  return (
    <>
      <Card className="mt-6 border-2 border-brand-purple/50 bg-gradient-to-r from-secondary/50 to-secondary/30 shadow-md">
        <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-transparent pb-3">
          <CardTitle className="flex items-center gap-2 text-brand-purple">
            <Sparkles className="h-5 w-5 text-brand-purple" />
            <span className="font-bold">🎯 AI Assistant Zone</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowApiKeyDialog(true)} 
              className="ml-auto"
            >
              <Settings className="h-4 w-4 mr-1" />
              AI Settings
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="text-sm text-muted-foreground">
            Select your business type and campaign goal to let AI generate message content for your campaign
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Type</label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Goal</label>
              <Select value={campaignGoal} onValueChange={setCampaignGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign goal" />
                </SelectTrigger>
                <SelectContent>
                  {campaignGoals.map((goal) => (
                    <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error generating content</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={generateContent} 
            disabled={isGenerating}
            className="w-full bg-brand-purple hover:bg-brand-purple/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Messages...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Messages
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
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
              <Select value={selectedModel} onValueChange={setSelectedModel}>
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
              <Label htmlFor="api-key">{aiModels.find(m => m.id === selectedModel)?.apiKeyName || "API Key"}</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
              <p className="text-xs text-muted-foreground">
                {selectedModel === "gemini" && "Optional: Leave blank to use default key"}
                {selectedModel === "openai" && "Required: Enter your OpenAI API key to use this model"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowApiKeyDialog(false);
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
    </>
  );
}
