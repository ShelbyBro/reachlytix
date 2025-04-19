
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

    try {
      // Generate email content
      const emailResponse = await supabase.functions.invoke('generate-campaign-content', {
        body: { businessType, campaignGoal, messageType: 'email' }
      });

      // Generate SMS content
      const smsResponse = await supabase.functions.invoke('generate-campaign-content', {
        body: { businessType, campaignGoal, messageType: 'sms' }
      });

      // Generate WhatsApp content
      const whatsappResponse = await supabase.functions.invoke('generate-campaign-content', {
        body: { businessType, campaignGoal, messageType: 'whatsapp' }
      });

      if (emailResponse.error || smsResponse.error || whatsappResponse.error) {
        throw new Error('Failed to generate content');
      }

      const emailContent = emailResponse.data.choices[0].message.content;
      const smsContent = smsResponse.data.choices[0].message.content;
      const whatsappContent = whatsappResponse.data.choices[0].message.content;

      // Extract subject from email content if present
      let email = emailContent;
      if (email.includes('Subject:')) {
        email = email.replace(/Subject:.*\n/, '').trim();
      }

      onGeneratedContent({
        email,
        sms: smsContent,
        whatsapp: whatsappContent
      });

      toast({
        title: "Content Generated",
        description: "AI has generated your campaign messages.",
      });

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
