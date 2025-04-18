
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, startOfDay, subDays } from "date-fns";

export type EmailAnalyticsSummary = {
  totalEmails: number;
  successRate: number;
  failedEmails: number;
  topCampaign: {
    id: string;
    title: string;
    count: number;
  } | null;
  emailsByStatus: { name: string; value: number }[];
  emailsOverTime: { date: string; count: number; status: string }[];
  emailsByCampaign: { name: string; value: number }[];
};

export type EmailAnalyticsFilters = {
  startDate: Date;
  endDate: Date;
  campaignId: string | null;
  clientId: string | null;
};

const DEFAULT_FILTERS: EmailAnalyticsFilters = {
  startDate: subDays(new Date(), 30),
  endDate: new Date(),
  campaignId: null,
  clientId: null,
};

// Generate mock data for testing
const generateMockData = (filters: EmailAnalyticsFilters): EmailAnalyticsSummary => {
  const mockCampaigns = [
    { id: "1", title: "Welcome Series" },
    { id: "2", title: "Newsletter" },
    { id: "3", title: "Product Update" },
    { id: "4", title: "Customer Feedback" },
  ];
  
  const totalEmails = Math.floor(Math.random() * 500) + 200;
  const successfulEmails = Math.floor(totalEmails * (0.7 + Math.random() * 0.25));
  const failedEmails = totalEmails - successfulEmails;
  
  // Generate time series data between start and end dates
  const emailsOverTime = [];
  let currentDate = startOfDay(filters.startDate);
  const endDate = startOfDay(filters.endDate);
  
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const successCount = Math.floor(Math.random() * 25) + 5;
    const failCount = Math.floor(Math.random() * 5);
    
    emailsOverTime.push({ 
      date: dateStr, 
      count: successCount,
      status: "delivered" 
    });
    
    emailsOverTime.push({ 
      date: dateStr, 
      count: failCount,
      status: "failed" 
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  // Generate campaign distribution
  const emailsByCampaign = mockCampaigns.map(campaign => {
    return {
      name: campaign.title,
      value: Math.floor(Math.random() * 100) + 10
    };
  });
  
  // Find top campaign
  const topCampaignIndex = emailsByCampaign
    .reduce((maxIndex, item, index, array) => 
      item.value > array[maxIndex].value ? index : maxIndex, 0);
  
  const topCampaign = {
    id: mockCampaigns[topCampaignIndex].id,
    title: mockCampaigns[topCampaignIndex].title,
    count: emailsByCampaign[topCampaignIndex].value
  };
  
  return {
    totalEmails,
    successRate: successfulEmails / totalEmails,
    failedEmails,
    topCampaign,
    emailsByStatus: [
      { name: "Delivered", value: successfulEmails },
      { name: "Failed", value: failedEmails }
    ],
    emailsOverTime,
    emailsByCampaign
  };
};

export function useEmailAnalytics() {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [filters, setFilters] = useState<EmailAnalyticsFilters>(DEFAULT_FILTERS);
  const [availableCampaigns, setAvailableCampaigns] = useState<{id: string; title: string}[]>([]);
  const [availableClients, setAvailableClients] = useState<{id: string; name: string}[]>([]);

  // Fetch campaigns for filter dropdown
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        let query = supabase.from("campaigns").select("id, title");
        
        // Filter by client_id if user is a client
        if (role === 'client' && user?.id) {
          query = query.eq("client_id", user.id);
        }
        
        // Filter by client_id if filter is set
        if (role === 'admin' && filters.clientId) {
          query = query.eq("client_id", filters.clientId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        if (data) setAvailableCampaigns(data as {id: string; title: string}[]);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };
    
    fetchCampaigns();
  }, [user, role, filters.clientId]);

  // Fetch clients (for admin dropdown)
  useEffect(() => {
    const fetchClients = async () => {
      if (role !== 'admin') return;
      
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("id, name");
          
        if (error) throw error;
        if (data) setAvailableClients(data as {id: string; name: string}[]);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    
    if (role === 'admin') {
      fetchClients();
    }
  }, [role]);

  // Use React Query to fetch email analytics data with caching
  const { data: emailAnalytics, isLoading, refetch } = useQuery({
    queryKey: ['emailAnalytics', filters, user?.id, role],
    queryFn: async () => {
      try {
        // 1. Get all email logs for this client or all if admin
        let emailLogsQuery = supabase.from("email_logs").select(`
          id, 
          status, 
          created_at,
          lead_id,
          leads:lead_id (
            client_id
          )
        `);
        
        // Apply date filters
        if (filters.startDate) {
          emailLogsQuery = emailLogsQuery.gte('created_at', filters.startDate.toISOString());
        }
        
        if (filters.endDate) {
          emailLogsQuery = emailLogsQuery.lte('created_at', filters.endDate.toISOString());
        }
        
        // Filter by client (user role or selected client filter)
        if (role === 'client' && user?.id) {
          // For client users, we need to filter to only their leads
          emailLogsQuery = emailLogsQuery.filter('leads.client_id', 'eq', user.id);
        } else if (role === 'admin' && filters.clientId) {
          // For admin with client filter
          emailLogsQuery = emailLogsQuery.filter('leads.client_id', 'eq', filters.clientId);
        }
        
        const { data: emailLogs, error: emailLogsError } = await emailLogsQuery;
        
        if (emailLogsError) throw emailLogsError;
        
        // Not enough real data to provide meaningful analytics
        if (!emailLogs || emailLogs.length < 5) {
          console.log("Not enough email logs data, using mock data");
          return generateMockData(filters);
        }
        
        // Process real data
        const totalEmails = emailLogs.length;
        const successfulEmails = emailLogs.filter(log => log.status === 'delivered').length;
        const failedEmails = totalEmails - successfulEmails;
        
        // Create date-based groupings
        const emailsByDate = emailLogs.reduce((acc, log) => {
          const dateStr = log.created_at.split('T')[0];
          const status = log.status;
          
          const existingEntry = acc.find(e => e.date === dateStr && e.status === status);
          
          if (existingEntry) {
            existingEntry.count += 1;
          } else {
            acc.push({ date: dateStr, count: 1, status });
          }
          
          return acc;
        }, [] as {date: string; count: number; status: string}[]);
        
        // TODO: Get campaign distribution (this would require joining with campaign data)
        // For now we'll use mock data for this part
        const campaignMockData = generateMockData(filters);
        
        return {
          totalEmails,
          successRate: totalEmails > 0 ? successfulEmails / totalEmails : 0,
          failedEmails,
          topCampaign: campaignMockData.topCampaign, // Use mock data for now
          emailsByStatus: [
            { name: "Delivered", value: successfulEmails },
            { name: "Failed", value: failedEmails }
          ],
          emailsOverTime: emailsByDate.length > 0 ? emailsByDate : campaignMockData.emailsOverTime,
          emailsByCampaign: campaignMockData.emailsByCampaign // Use mock data for now
        };
      } catch (error) {
        console.error("Error fetching email analytics:", error);
        toast({
          variant: "destructive",
          title: "Error loading email analytics",
          description: "Unable to load email analytics data."
        });
        
        // Fall back to mock data
        return generateMockData(filters);
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  return {
    emailAnalytics: emailAnalytics || generateMockData(filters),
    isLoading,
    filters,
    setFilters,
    availableCampaigns,
    availableClients,
    refreshData: refetch
  };
}
