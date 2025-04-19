
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLeadValidator } from "./use-lead-validator";
import { useAuth } from "@/contexts/AuthContext";

interface Lead {
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  validation_errors?: string[];
  is_duplicate?: boolean;
}

export function useLeadGenerator() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { validateEmail, validatePhone } = useLeadValidator();
  const { toast } = useToast();
  const { user } = useAuth();

  const processLeads = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    const processedLeads: Lead[] = [];
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();

    try {
      for (const file of files) {
        const text = await file.text();
        const rows = text.split('\n');
        const headers = rows[0].toLowerCase().split(',').map(h => h.trim());

        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          const values = rows[i].split(',').map(v => v.trim());
          const lead: Lead = {
            name: values[headers.indexOf('name')] || '',
            email: values[headers.indexOf('email')] || '',
            phone: values[headers.indexOf('phone')] || '',
            source: values[headers.indexOf('source')] || file.name,
            status: 'valid',
            validation_errors: []
          };

          // Validate email and phone
          const emailValidation = validateEmail(lead.email);
          const phoneValidation = validatePhone(lead.phone);

          if (!emailValidation.isValid) {
            lead.validation_errors?.push(...emailValidation.errors);
          }
          if (!phoneValidation.isValid) {
            lead.validation_errors?.push(...phoneValidation.errors);
          }

          // Check for duplicates
          if (seenEmails.has(lead.email) || seenPhones.has(lead.phone)) {
            lead.is_duplicate = true;
            lead.status = 'duplicate';
          } else {
            seenEmails.add(lead.email);
            seenPhones.add(lead.phone);
          }

          // Set final status
          if (lead.validation_errors?.length && !lead.is_duplicate) {
            lead.status = 'invalid';
          }

          processedLeads.push(lead);
        }
      }

      setLeads(processedLeads);

      // Store valid leads in Supabase
      const validLeads = processedLeads.filter(lead => 
        lead.status === 'valid' && !lead.is_duplicate
      );

      if (validLeads.length > 0 && user) {
        const { error } = await supabase
          .from('cleaned_leads')
          .insert(validLeads.map(lead => ({
            ...lead,
            client_id: user.id,
            validation_errors: lead.validation_errors?.length ? lead.validation_errors : null
          })));

        if (error) throw error;
      }

      toast({
        title: "Leads Processed",
        description: `Processed ${processedLeads.length} leads. ${validLeads.length} valid, ${processedLeads.length - validLeads.length} invalid/duplicate.`
      });

    } catch (error) {
      console.error('Error processing leads:', error);
      toast({
        variant: "destructive",
        title: "Error Processing Leads",
        description: "Failed to process leads. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  }, [validateEmail, validatePhone, toast, user]);

  const generateLeadsWithAI = useCallback(async (prompt: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-leads', {
        body: { prompt }
      });

      if (error) throw error;

      // OpenAI returns a choices array, so we need to parse the content differently
      const generatedContent = data.choices[0].message.content;
      let generatedLeads: Lead[];

      try {
        // Attempt to parse the generated content as JSON
        generatedLeads = JSON.parse(generatedContent);
      } catch (e) {
        throw new Error('Failed to parse generated leads. The AI might not have returned a valid JSON array.');
      }

      // Validate and prepare leads
      const validatedLeads = generatedLeads.map(lead => ({
        ...lead,
        status: 'valid',
        validation_errors: [],
        source: 'AI Generated'
      }));

      setLeads(validatedLeads);

      toast({
        title: "Leads Generated",
        description: `Successfully generated ${validatedLeads.length} leads using AI.`
      });

    } catch (error) {
      console.error('Error generating leads:', error);
      toast({
        variant: "destructive",
        title: "Error Generating Leads",
        description: error.message || "Failed to generate leads with AI."
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  return {
    leads,
    isProcessing,
    processLeads,
    generateLeadsWithAI
  };
}
