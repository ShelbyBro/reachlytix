
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
      
      // Fetch leads assigned to current ISO user
      // For now, we'll simply fetch all leads and assume they belong to the current ISO
      // In a real implementation, this would filter by ISO relationship
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'assigned');
        
      if (error) {
        throw error;
      }
      
      // Transform the data to fit our IsoLead type
      const transformedLeads = data.map((lead: any) => ({
        id: lead.id,
        name: lead.name || 'Unnamed Lead',
        email: lead.email,
        phone: lead.phone,
        status: lead.status || 'assigned',
        created_at: lead.created_at,
        updated_at: lead.created_at, // Using created_at as updated_at for now
        iso_id: user.id, // Assuming the current user is the ISO
        documents: [], // We'll populate these later if needed
        notes: []      // We'll populate these later if needed
      }));
      
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
          { event: '*', schema: 'public', table: 'leads' }, 
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
      // Update the lead status directly in the leads table
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          // Use a computed field for updated_at since it might not exist in your schema
          ...(supabase.rpc ? { updated_at: new Date().toISOString() } : {})
        })
        .eq('id', leadId);
        
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
      const updatedNotes = [...existingNotes, newNote];
      
      // For now, we store notes in memory only, since there's no notes table
      // In a real implementation, you would store this in a dedicated notes table
      
      // Update local state only
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                notes: updatedNotes,
                updated_at: new Date().toISOString() 
              } 
            : lead
        )
      );
      
      toast.success('Note added successfully');
      
      // Note: In a real implementation, you would save this note to the database
      console.log('Note added (in memory only):', newNote);
      
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
