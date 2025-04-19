
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export function AICampaignGenerator({ onGeneratedContent }: AICampaignGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
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

    setIsGenerating(true);

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAXfF5sFm0kmEHGJI780nDA_as6kCsyWMc',
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

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from AI');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
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
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate campaign content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mt-6 border-2 border-brand-purple/50 bg-gradient-to-r from-secondary/50 to-secondary/30 shadow-md">
      <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-transparent pb-3">
        <CardTitle className="flex items-center gap-2 text-brand-purple">
          <Sparkles className="h-5 w-5 text-brand-purple" />
          <span className="font-bold">🎯 AI Assistant Zone</span>
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
  );
}
