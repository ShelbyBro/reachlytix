
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type IsoLeadDocument = {
  name: string;
  url: string;
  type: string;
};

export type IsoLeadNote = {
  content: string;
  timestamp: string;
  created_by: string;
};

export type IsoLead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  iso_id: string | null;
  documents?: IsoLeadDocument[];
  notes?: IsoLeadNote[];
};

export function useIsoLeads() {
  const [leads, setLeads] = useState<IsoLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchLeads = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch leads assigned to current ISO
      const { data, error } = await supabase
        .from('leads')
        .select('*, iso_leads(status, documents, notes)')
        .eq('iso_leads.iso_id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Transform the data to fit our IsoLead type
      const transformedLeads = data.map((lead: any) => {
        const isoLeadData = lead.iso_leads ? lead.iso_leads[0] : {};
        return {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: isoLeadData.status || 'assigned',
          created_at: lead.created_at,
          updated_at: lead.updated_at,
          iso_id: lead.iso_id,
          documents: isoLeadData.documents || [],
          notes: isoLeadData.notes || []
        };
      });
      
      setLeads(transformedLeads);
    } catch (error: any) {
      console.error('Error fetching ISO leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeads();
      
      // Set up subscription for real-time updates
      const channel = supabase
        .channel('iso-leads-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'iso_leads' }, 
          () => {
            fetchLeads();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('iso_leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('lead_id', leadId)
        .eq('iso_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: newStatus, updated_at: new Date().toISOString() } 
            : lead
        )
      );
      
      toast.success(`Lead status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
      throw error;
    }
  };

  const addLeadNote = async (leadId: string, noteContent: string) => {
    if (!user) return;
    
    try {
      // Get current lead
      const lead = leads.find(l => l.id === leadId);
      if (!lead) throw new Error('Lead not found');
      
      // Prepare new note
      const newNote = {
        content: noteContent,
        timestamp: new Date().toISOString(),
        created_by: user.id
      };
      
      // Get existing notes or initialize empty array
      const existingNotes = lead.notes || [];
      
      // Update the iso_leads entry with the new note added
      const { error } = await supabase
        .from('iso_leads')
        .update({ 
          notes: [...existingNotes, newNote],
          updated_at: new Date().toISOString() 
        })
        .eq('lead_id', leadId)
        .eq('iso_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                notes: [...(lead.notes || []), newNote],
                updated_at: new Date().toISOString() 
              } 
            : lead
        )
      );
      
      toast.success('Note added successfully');
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
      throw error;
    }
  };

  return {
    leads,
    isLoading,
    updateLeadStatus,
    addLeadNote,
    refreshLeads: fetchLeads
  };
}
