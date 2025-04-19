
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

    const generateForType = async (messageType: 'email' | 'sms' | 'whatsapp') => {
      try {
        console.log(`Generating ${messageType} content for ${businessType} with goal: ${campaignGoal}`);
        
        const response = await supabase.functions.invoke('generate-campaign-content', {
          body: { businessType, campaignGoal, messageType }
        });

        console.log(`${messageType} response:`, response);
        
        if (response.error) {
          console.error(`Error from edge function for ${messageType}:`, response.error);
          throw new Error(`Error generating ${messageType}: ${response.error.message || 'Unknown error'}`);
        }
        
        if (!response.data) {
          throw new Error(`No data returned for ${messageType}`);
        }
        
        if (response.data.error) {
          console.error(`Error in response data for ${messageType}:`, response.data.error);
          throw new Error(`Error with ${messageType} generation: ${response.data.error}`);
        }

        if (!response.data.success) {
          throw new Error(`Failed to generate ${messageType}: ${response.data.error || 'Unknown error'}`);
        }
        
        if (!response.data.content) {
          throw new Error(`No content returned for ${messageType}`);
        }
        
        return response.data.content as string;
      } catch (err: any) {
        console.error(`Error in ${messageType} generation:`, err);
        throw new Error(`${messageType} generation failed: ${err.message}`);
      }
    };

    try {
      // Generate all content types in parallel for better performance
      const results = await Promise.allSettled([
        generateForType('email'),
        generateForType('sms'),
        generateForType('whatsapp')
      ]);
      
      // Extract results and handle any failures
      const [emailResult, smsResult, whatsappResult] = results;
      
      let emailContent = '';
      let smsContent = '';
      let whatsappContent = '';
      let hasSuccessfulGeneration = false;
      let failures = [];

      if (emailResult.status === 'fulfilled') {
        emailContent = emailResult.value;
        hasSuccessfulGeneration = true;
      } else {
        failures.push(`Email: ${emailResult.reason.message}`);
      }

      if (smsResult.status === 'fulfilled') {
        smsContent = smsResult.value;
        hasSuccessfulGeneration = true;
      } else {
        failures.push(`SMS: ${smsResult.reason.message}`);
      }

      if (whatsappResult.status === 'fulfilled') {
        whatsappContent = whatsappResult.value;
        hasSuccessfulGeneration = true;
      } else {
        failures.push(`WhatsApp: ${whatsappResult.reason.message}`);
      }

      if (!hasSuccessfulGeneration) {
        throw new Error(`All content generation failed: ${failures.join(', ')}`);
      }

      // Extract subject from email content if present
      let email = emailContent;
      if (email && email.includes('Subject:')) {
        email = email.replace(/Subject:.*\n/, '').trim();
      }

      onGeneratedContent({
        email: email || '',
        sms: smsContent || '',
        whatsapp: whatsappContent || ''
      });

      if (failures.length > 0) {
        toast({
          title: "Partial Content Generated",
          description: `Some content was generated successfully, but there were issues: ${failures.join(', ')}`,
          variant: "warning"
        });
      } else {
        toast({
          title: "Content Generated",
          description: "AI has generated your campaign messages.",
        });
      }

    } catch (error: any) {
      console.error('Error generating content:', error);
      setError(error.message || "Failed to generate content");
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate campaign content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    error,
    generateContent,
  };
};
