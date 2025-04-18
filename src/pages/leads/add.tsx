import React, { useState } from "react";
import Layout from "@/components/layout";
import { CSVUploader } from "@/components/csv-uploader";
import { CampaignDropdown } from "@/components/campaigns/campaign-dropdown";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function AddLeadsPage() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLeads = async (filters: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate leads.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-leads-from-api', {
        body: {
          keyword: filters.keyword || '',
          location: filters.location || '',
          platform: filters.platform || ''
        }
      });

      if (error) throw error;

      // Add the generated leads to the cleaned_leads table
      if (data.leads && data.leads.length > 0) {
        const { error: insertError } = await supabase
          .from('cleaned_leads')
          .insert(data.leads.map((lead: any) => ({
            ...lead,
            client_id: user.id
          })));

        if (insertError) throw insertError;

        toast({
          title: "Leads Generated",
          description: `Successfully generated ${data.leads.length} leads. ${data.message}`,
        });
      }
    } catch (error) {
      console.error('Error generating leads:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate leads. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="relative">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Add Leads
              </h1>
              <p className="text-muted-foreground">
                Upload your CSV file to add leads
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <CSVUploader />

            <CampaignDropdown />

            <div className="flex justify-between items-center mt-6">
              <div className="space-x-2">
                <input
                  type="text"
                  name="keyword"
                  placeholder="Keyword"
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  className="border p-2 rounded"
                />
                <select name="platform" className="border p-2 rounded">
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                </select>
              </div>
              
              <Button
                variant="outline"
                onClick={() => handleGenerateLeads({
                  keyword: document.querySelector<HTMLInputElement>('[name="keyword"]')?.value,
                  location: document.querySelector<HTMLInputElement>('[name="location"]')?.value,
                  platform: document.querySelector<HTMLSelectElement>('[name="platform"]')?.value
                })}
                disabled={isGenerating}
                className="ml-2"
              >
                <Zap className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "Use Real Data (API)"}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-2">
              Note: Real web scraping API coming soon — stay tuned!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
