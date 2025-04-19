
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface AIGeneratorResult {
  email: string;
  sms: string;
  whatsapp: string;
}

interface UseAIGeneratorProps {
  onGeneratedContent: (content: AIGeneratorResult) => void;
}

export const useAIGenerator = ({ onGeneratedContent }: UseAIGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleOpenAIFallback = () => {
    setSelectedModel("openai");
  };

  const handleErrorToast = () => {
    if (selectedModel === "gemini") {
      toast({
        title: "Try OpenAI Instead",
        description: "Gemini API failed. Consider switching to OpenAI in the AI settings.",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenAIFallback}
          >
            Switch
          </Button>
        )
      });
    }
  };

  const generateContent = async (businessType: string, campaignGoal: string) => {
    if (!businessType || !campaignGoal) {
      toast({
        title: "Missing Information",
        description: "Please select both business type and campaign goal.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let response;
      let data;
      
      if (selectedModel === "gemini") {
        const apiKeyToUse = apiKey || 'AIzaSyAXfF5sFm0kmEHGJI780nDA_as6kCsyWMc';
        
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
        
        processGeneratedText(data.candidates[0].content.parts[0].text);
        
      } else if (selectedModel === "openai") {
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
        
        processGeneratedText(data.choices[0].message.content);
      }

    } catch (error: any) {
      console.error('Error generating content:', error);
      setError(error.message || "Failed to generate content");
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate campaign content. Please try again.",
        variant: "destructive"
      });
      
      handleErrorToast();
    } finally {
      setIsGenerating(false);
    }
  };

  const processGeneratedText = (generatedText: string) => {
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

  return {
    isGenerating,
    selectedModel,
    setSelectedModel,
    apiKey,
    setApiKey,
    error,
    generateContent,
  };
};
