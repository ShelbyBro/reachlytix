
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLeadValidator } from "./use-lead-validator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  validation_errors?: string[];
  is_duplicate?: boolean;
  client_id?: string;
  created_at?: string;
}

interface ManualLead {
  name: string;
  email: string;
  phone: string;
  source: string;
}

export function useLeadGenerator() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { validateEmail, validatePhone } = useLeadValidator();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    if (!user) return;
    
    try {
      setIsProcessing(true);
      const { data, error } = await supabase
        .from('cleaned_leads')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to match our Lead interface
      const formattedLeads: Lead[] = data?.map(lead => {
        // Handle validation_errors conversion properly based on its type
        let validationErrors: string[] | undefined = undefined;
        
        if (lead.validation_errors) {
          if (Array.isArray(lead.validation_errors)) {
            // If it's already an array, map each item to string
            validationErrors = (lead.validation_errors as any[]).map(error => 
              String(error)
            );
          } else if (typeof lead.validation_errors === 'string') {
            // If it's a string, wrap in array
            validationErrors = [lead.validation_errors];
          } else if (typeof lead.validation_errors === 'object') {
            // If it's an object, convert to array of strings
            validationErrors = Object.values(lead.validation_errors).map(val => String(val));
          }
        }
        
        return {
          id: lead.id,
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          source: lead.source || '',
          status: lead.status,
          validation_errors: validationErrors,
          is_duplicate: lead.is_duplicate || false,
          client_id: lead.client_id,
          created_at: lead.created_at
        };
      }) || [];
      
      setLeads(formattedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error("Failed to fetch leads");
    } finally {
      setIsProcessing(false);
    }
  };

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
          const lead: Partial<Lead> = {
            name: values[headers.indexOf('name')] || '',
            email: values[headers.indexOf('email')] || '',
            phone: values[headers.indexOf('phone')] || '',
            source: values[headers.indexOf('source')] || file.name,
            status: 'valid',
            validation_errors: []
          };

          const emailValidation = validateEmail(lead.email || '');
          const phoneValidation = validatePhone(lead.phone || '');

          if (!emailValidation.isValid) {
            lead.validation_errors?.push(...emailValidation.errors);
          }
          if (!phoneValidation.isValid) {
            lead.validation_errors?.push(...phoneValidation.errors);
          }

          if (seenEmails.has(lead.email || '') || seenPhones.has(lead.phone || '')) {
            lead.is_duplicate = true;
            lead.status = 'duplicate';
          } else {
            seenEmails.add(lead.email || '');
            seenPhones.add(lead.phone || '');
          }

          if (lead.validation_errors?.length && !lead.is_duplicate) {
            lead.status = 'invalid';
          }

          processedLeads.push(lead as Lead);
        }
      }

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
        
        fetchLeads();
      }

      toast.success(`Processed ${processedLeads.length} leads. ${validLeads.length} valid, ${processedLeads.length - validLeads.length} invalid/duplicate.`);

    } catch (error) {
      console.error('Error processing leads:', error);
      toast.error("Failed to process leads. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [validateEmail, validatePhone, user]);

  const addManualLead = useCallback(async (lead: ManualLead) => {
    if (!user) {
      toast.error("You must be logged in to add leads");
      return;
    }
    
    setIsProcessing(true);
    try {
      const emailValidation = validateEmail(lead.email);
      const phoneValidation = validatePhone(lead.phone);
      
      let validationErrors: string[] = [];
      
      if (!emailValidation.isValid) {
        validationErrors.push(...emailValidation.errors);
      }
      
      if (!phoneValidation.isValid) {
        validationErrors.push(...phoneValidation.errors);
      }
      
      const { data: existingLeads, error: checkError } = await supabase
        .from('cleaned_leads')
        .select('id')
        .or(`email.eq.${lead.email},phone.eq.${lead.phone}`)
        .eq('client_id', user.id);
        
      if (checkError) throw checkError;
      
      if (existingLeads && existingLeads.length > 0) {
        toast.error("A lead with this email or phone already exists");
        return;
      }
      
      const newLead = {
        ...lead,
        client_id: user.id,
        status: validationErrors.length ? 'invalid' : 'valid',
        validation_errors: validationErrors.length ? validationErrors : null,
        is_duplicate: false
      };
      
      const { error } = await supabase
        .from('cleaned_leads')
        .insert([newLead]);
        
      if (error) throw error;
      
      toast.success("Lead added successfully");
      
      fetchLeads();
      
    } catch (error) {
      console.error('Error adding manual lead:', error);
      toast.error("Failed to add lead. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [validateEmail, validatePhone, user]);

  const deleteLead = useCallback(async (leadId: string) => {
    if (!user) return;
    
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from('cleaned_leads')
        .delete()
        .eq('id', leadId)
        .eq('client_id', user.id);
        
      if (error) throw error;
      
      setLeads(leads.filter(lead => lead.id !== leadId));
      
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [leads, user]);

  const generateLeadsWithAI = useCallback(async (prompt: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-leads', {
        body: { prompt }
      });

      if (error) throw error;

      const generatedContent = data.choices[0].message.content;
      let generatedLeads: Lead[];

      try {
        generatedLeads = JSON.parse(generatedContent);
      } catch (e) {
        throw new Error('Failed to parse generated leads. The AI might not have returned a valid JSON array.');
      }

      const validatedLeads = generatedLeads.map(lead => ({
        ...lead,
        status: 'valid',
        validation_errors: [],
        source: 'AI Generated'
      }));

      setLeads(validatedLeads);

      toast.success("Leads Generated", {
        description: `Successfully generated ${validatedLeads.length} leads using AI.`
      });

    } catch (error) {
      console.error('Error generating leads:', error);
      toast.error("Error Generating Leads", {
        description: error.message || "Failed to generate leads with AI."
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    leads,
    isProcessing,
    processLeads,
    generateLeadsWithAI,
    addManualLead,
    deleteLead
  };
}
