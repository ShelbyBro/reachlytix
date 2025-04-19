
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useAIGenerator } from '@/hooks/use-ai-generator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AICampaignGeneratorProps {
  onGeneratedContent: (content: {
    email: string;
    sms: string;
    whatsapp: string;
  }) => void;
}

const businessTypes = [
  "E-commerce", "SaaS", "Real Estate", "Healthcare",
  "Professional Services", "Retail", "Education", "Dental", "Other"
];

const campaignGoals = [
  "Lead Generation", "Sales Promotion", "Brand Awareness",
  "Customer Retention", "Product Launch", "Event Promotion"
];

export function AICampaignGenerator({ onGeneratedContent }: AICampaignGeneratorProps) {
  const [businessType, setBusinessType] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");

  const { isGenerating, error, generateContent } = useAIGenerator({ onGeneratedContent });
  
  const isValid = businessType.trim() !== "" && campaignGoal.trim() !== "";

  const handleGenerate = () => {
    if (isValid) {
      generateContent(businessType, campaignGoal);
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

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !isValid}
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

        {!isValid && businessType !== "" && (
          <p className="text-xs text-amber-500">Please select both a business type and campaign goal to continue</p>
        )}
      </CardContent>
    </Card>
  );
}
