
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Lead {
  name: string;
  phone: string;
  email: string;
  website: string;
  source: string;
  address?: string;
  company?: string;
}

export function useSmartScrape() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [limit, setLimit] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [savingIndices, setSavingIndices] = useState<number[]>([]);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateLeads = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim() || !location.trim()) {
      toast({
        title: "Missing fields",
        description: "Keyword and location are required.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setLeads([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('smart-scrape', {
        body: { keyword, location, limit },
      });

      if (error) throw error;

      if (data?.status === 'success' && Array.isArray(data.leads)) {
        setLeads(data.leads);
        
        if (data.leads.length === 0) {
          toast({
            title: "No Leads Found",
            description: "Try a different keyword or location.",
          });
        } else {
          toast({
            title: "Leads Generated",
            description: `Successfully generated ${data.leads.length} leads.`,
          });
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating leads:', error);
      toast({
        title: "Error",
        description: "Failed to generate leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveLead = async (lead: Lead, index: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save leads.",
        variant: "destructive",
      });
      return;
    }

    setSavingIndices(prev => [...prev, index]);

    try {
      const { error } = await supabase.from("cleaned_leads").insert([{
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        source: `${lead.source} (${lead.address || 'No address'})`,
        client_id: user.id,
        status: "valid"
      }]);

      if (error) throw error;

      toast({
        title: "Lead Saved",
        description: `Successfully saved ${lead.name} to your leads.`,
      });
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: "Error",
        description: "Failed to save lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingIndices(prev => prev.filter(i => i !== index));
    }
  };

  const saveAllLeads = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save leads.",
        variant: "destructive",
      });
      return;
    }

    if (leads.length === 0) {
      toast({
        title: "No Leads to Save",
        description: "Generate leads first before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingAll(true);

    try {
      const leadsToInsert = leads.map(lead => ({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        source: `${lead.source} (${lead.address || 'No address'})`,
        client_id: user.id,
        status: "valid"
      }));

      const { error } = await supabase.from("cleaned_leads").insert(leadsToInsert);

      if (error) throw error;

      toast({
        title: "All Leads Saved",
        description: `Successfully saved ${leads.length} leads to your collection.`,
      });
    } catch (error) {
      console.error('Error saving all leads:', error);
      toast({
        title: "Error",
        description: "Failed to save all leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAll(false);
    }
  };

  return {
    keyword,
    setKeyword,
    location,
    setLocation,
    limit,
    setLimit,
    isLoading,
    leads,
    savingIndices,
    isSavingAll,
    generateLeads,
    saveLead,
    saveAllLeads
  };
}
